/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from 'react'

import { useAgentConnections, AgentConnectionHandlers } from './hooks/useAgentConnections'
import { createUserMessageActivity, postActivity } from './lib/directLineClient'
import { extractCsvFileName } from './lib/textExtraction'
import {
  buildApprovalPrompt,
  buildGeneratePrompt,
  buildPlayTestCasePrompt,
  buildRevisionPrompt
} from './lib/prompts'
import { Agent2StreamEntry, ConsentCardInfo, SavedTestCase } from './types'
import { styles } from './styles'

import AppHeader from './components/AppHeader'
import InstructionCard from './components/InstructionCard'
import FeedbackCard from './components/FeedbackCard'
import ConnectorConsentCard from './components/ConnectorConsentCard'
import GeneratedPreviewCard from './components/GeneratedPreviewCard'
import SavedTestCasesCard from './components/SavedTestCasesCard'
import Agent2Panel from './components/Agent2Panel'
import RawResponsePanel from './components/RawResponsePanel'

const RAW_ACTIVITY_SEPARATOR = '\n\n---------------------- RAW ACTIVITY ----------------------\n\n'

function Chat() {
  const [playingTestCaseId, setPlayingTestCaseId] = useState<number | null>(null)
  const [status, setStatus] = useState('Connecting to Agent 1...')
  const [instruction, setInstruction] = useState('I want you to ....')
  const [feedback, setFeedback] = useState('')
  const [csvOutput, setCsvOutput] = useState('')
  const [agent2Instruction, setAgent2Instruction] = useState('')
  const [currentTestCaseName, setCurrentTestCaseName] = useState('')
  const [fullResponse, setFullResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [consentCard, setConsentCard] = useState<ConsentCardInfo | null>(null)
  const [savedTestCases, setSavedTestCases] = useState<SavedTestCase[]>([])
  const [selectedSavedTestCase, setSelectedSavedTestCase] = useState<SavedTestCase | null>(null)
  const [currentOutputSaved, setCurrentOutputSaved] = useState(false)
  const [agent2SignInUrl, setAgent2SignInUrl] = useState<string | null>(null)
  const [agent2Entries, setAgent2Entries] = useState<Agent2StreamEntry[]>([])
  const [agent2Running, setAgent2Running] = useState(false)
  const [magicCode, setMagicCode] = useState('')

  const connectionHandlers: AgentConnectionHandlers = {
    onStatusChange: setStatus,

    onLoadingChange: setIsLoading,

    onRawActivity: rawActivity => {
      setFullResponse(previous => {
        return previous ? previous + RAW_ACTIVITY_SEPARATOR + rawActivity : rawActivity
      })
    },

    onConsentCard: setConsentCard,

    onAgent1Result: result => {
      setCurrentOutputSaved(false)

      if (result.csvContent) {
        setCsvOutput(result.csvContent)
      }

      if (result.agent2Instruction) {
        setAgent2Instruction(result.agent2Instruction)
      }

      if (result.testCaseName) {
        setCurrentTestCaseName(result.testCaseName)
      }
    },

    onAgent2SignInRequired: signInUrl => {
      setAgent2SignInUrl(signInUrl)
      setStatus('Agent 2 needs sign-in to run the CUA. Click "Sign in to Agent 2".')
    },

    onAgent2SignedIn: () => {
      setAgent2SignInUrl(null)
      setStatus('Agent 2 signed in via token exchange.')
    },

    onAgent2Stream: setAgent2Entries,

    onAgent2RunFinished: () => {
      setAgent2Running(false)
      setStatus('Agent 2 finished the test case run.')
    }
  }

  const { connection, connection2, clearAgent2Stream } = useAgentConnections(connectionHandlers)

  function sendMessageToAgent(message: string) {
    if (!connection) {
      setStatus('Agent connection is not ready yet.')
      return
    }

    setIsLoading(true)
    setStatus('Sending message to Agent 1...')

    postActivity(connection, createUserMessageActivity(message))
      .then(() => {
        setStatus('Message sent. Waiting for Agent 1 response...')
      })
      .catch((error: any) => {
        console.error('Failed to send message:', error)
        setIsLoading(false)
        setStatus('Failed to send message to Agent 1. Check browser console.')
      })
  }

  function sendConsentResponse(action: 'Allow' | 'Cancel') {
    if (!connection || !consentCard) {
      setStatus('Consent card is not ready.')
      return
    }

    const extra: Record<string, any> = {
      value: action === 'Allow' ? consentCard.allowData : consentCard.cancelData
    }

    if (consentCard.replyToId) {
      extra.replyToId = consentCard.replyToId
    }

    setIsLoading(true)
    setStatus(`${action} sent. Waiting for Agent 1 to continue...`)

    postActivity(connection, createUserMessageActivity(action, extra))
      .then(() => {
        setConsentCard(null)
        setStatus(`${action} response sent. Waiting for Agent 1 response...`)
      })
      .catch((error: any) => {
        console.error('Failed to send consent response:', error)
        setIsLoading(false)
        setStatus('Failed to send connector permission response. Check browser console.')
      })
  }

  function generateOutput() {
    setCsvOutput('')
    setAgent2Instruction('')
    setCurrentTestCaseName('')
    setFullResponse('')
    setConsentCard(null)
    setSelectedSavedTestCase(null)
    setCurrentOutputSaved(false)

    sendMessageToAgent(buildGeneratePrompt(instruction))
  }

  function sendChanges() {
    setConsentCard(null)
    sendMessageToAgent(buildRevisionPrompt(feedback))
  }

  function getResolvedSavedName() {
    const responseName = extractCsvFileName(`${fullResponse}\n${currentTestCaseName}\n${csvOutput}\n${agent2Instruction}`)
    return responseName || currentTestCaseName || 'Generated Test Case'
  }

  function approveAndSave() {
    setConsentCard(null)

    if (currentOutputSaved) {
      setStatus('The current generated output has already been saved. Generate a new output to save another test case.')
      return
    }

    const resolvedName = getResolvedSavedName()
    const savedTestCase: SavedTestCase = {
      id: Date.now(),
      name: resolvedName,
      csvContent: csvOutput,
      instruction: agent2Instruction
    }

    setSavedTestCases(previous => [...previous, savedTestCase])
    setSelectedSavedTestCase(savedTestCase)
    setCurrentOutputSaved(true)
    setStatus(`Saved test case "${resolvedName}" to the list.`)

    sendMessageToAgent(buildApprovalPrompt())
  }

  function submitAgent2Code() {
    if (!connection2 || !magicCode.trim()) {
      return
    }

    postActivity(connection2, createUserMessageActivity(magicCode.trim()))
      .then(() => {
        setStatus('Sign-in code submitted to Agent 2.')
        setMagicCode('')
        setAgent2SignInUrl(null)
      })
      .catch((error: any) => {
        console.error('Failed to submit sign-in code:', error)
        setStatus('Failed to submit sign-in code. Check console.')
      })
  }

  function clearAgent2Run() {
    clearAgent2Stream()
    setAgent2Entries([])
    setAgent2Running(false)
  }

  function handlePlaySavedTestCase(testCase: SavedTestCase) {
    if (!connection2) {
      setStatus('Agent 2 connection is not ready yet.')
      return
    }

    /*
     * Never wipe a run that is still in progress. The user can wait for the
     * finish marker or press "Clear run" to discard it explicitly.
     */
    if (agent2Running) {
      setStatus(`Agent 2 is still running a test case. Wait for it to finish (or use "Clear run") before starting "${testCase.name}".`)
      return
    }

    // The previous run has finished, so clear its output before starting.
    clearAgent2Run()

    setPlayingTestCaseId(testCase.id)
    setIsLoading(true)
    setStatus(`Running saved test case "${testCase.name}" via Agent 2...`)

    postActivity(connection2, createUserMessageActivity(buildPlayTestCasePrompt(testCase)))
      .then(() => {
        setIsLoading(false)
        setPlayingTestCaseId(null)
        setAgent2Running(true)
        setStatus(`Agent 2 started running saved test case "${testCase.name}".`)
      })
      .catch((error: any) => {
        console.error('Failed to send play message to Agent 2:', error)
        setIsLoading(false)
        setPlayingTestCaseId(null)
        setStatus('Failed to send play message to Agent 2. Check browser console.')
      })
  }

  const canGenerate = Boolean(connection && instruction.trim())
  const canApprove = Boolean(connection && (csvOutput.trim() || agent2Instruction.trim()))
  const canRevise = Boolean(connection && feedback.trim())

  return (
    <div style={styles.page}>
      <AppHeader status={status} isConnected={Boolean(connection)} />

      <div style={styles.grid}>
        <div style={styles.leftColumn}>
          <InstructionCard
            instruction={instruction}
            canGenerate={canGenerate}
            isLoading={isLoading}
            onInstructionChange={setInstruction}
            onGenerate={generateOutput}
          />

          <FeedbackCard
            feedback={feedback}
            canRevise={canRevise}
            isLoading={isLoading}
            onFeedbackChange={setFeedback}
            onSendChanges={sendChanges}
          />

          {consentCard && (
            <ConnectorConsentCard
              consentCard={consentCard}
              isLoading={isLoading}
              onRespond={sendConsentResponse}
            />
          )}
        </div>

        <div style={styles.rightColumn}>
          <GeneratedPreviewCard
            csvOutput={csvOutput}
            agent2Instruction={agent2Instruction}
            canApprove={canApprove}
            isLoading={isLoading}
            isSaved={currentOutputSaved}
            onApproveAndSave={approveAndSave}
          />

          <SavedTestCasesCard
            testCases={savedTestCases}
            selectedTestCase={selectedSavedTestCase}
            playingTestCaseId={playingTestCaseId}
            onSelect={setSelectedSavedTestCase}
            onClearSelection={() => setSelectedSavedTestCase(null)}
            onPlay={handlePlaySavedTestCase}
          />

          {(agent2SignInUrl || agent2Entries.length > 0) && (
            <Agent2Panel
              signInUrl={agent2SignInUrl}
              entries={agent2Entries}
              isRunning={agent2Running}
              magicCode={magicCode}
              onMagicCodeChange={setMagicCode}
              onSubmitMagicCode={submitAgent2Code}
              onDismissSignIn={() => setAgent2SignInUrl(null)}
              onClearRun={() => {
                clearAgent2Run()
                setStatus('Agent 2 run cleared.')
              }}
            />
          )}

          <RawResponsePanel fullResponse={fullResponse} />
        </div>
      </div>
    </div>
  )
}

export default Chat
