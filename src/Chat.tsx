/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from 'react'
import { CopilotStudioClient, CopilotStudioWebChat, CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client'

import { acquireToken } from './acquireToken'
import { SampleConnectionSettings } from './settings'

type ConsentCardInfo = {
  title: string
  connectorName: string
  description: string
  permissions: string
  allowData: any
  cancelData: any
  replyToId?: string
}

type SavedTestCase = {
  id: number
  name: string
  csvContent: string
  instruction: string
}

function extractBetween (text: string, startMarker: string, endMarker: string): string {
  if (!text) {
    return ''
  }

  const start = text.indexOf(startMarker)
  const end = text.indexOf(endMarker)

  if (start === -1 || end === -1 || end <= start) {
    return ''
  }

  return text.substring(start + startMarker.length, end).trim()
}

function extractCsvFileName (text: string): string {
  if (!text) {
    return ''
  }

  const csvFileNameMatch = text.match(/CSV File Name:\s*([^\n\r]+)/i)
  if (csvFileNameMatch?.[1]) {
    return csvFileNameMatch[1].trim()
  }

  const scriptNameMatch = text.match(/Script Name:\s*([^\n\r]+)/i)
  if (scriptNameMatch?.[1]) {
    return scriptNameMatch[1].trim()
  }

  return ''
}

function stringifyActivity (activity: any): string {
  try {
    return JSON.stringify(activity, null, 2)
  } catch {
    return String(activity)
  }
}

function collectTextFromCard (node: any): string[] {
  const texts: string[] = []

  if (!node || typeof node !== 'object') {
    return texts
  }

  if (typeof node.text === 'string') {
    texts.push(node.text)
  }

  if (typeof node.altText === 'string') {
    texts.push(node.altText)
  }

  if (Array.isArray(node.inlines)) {
    node.inlines.forEach((inline: any) => {
      texts.push(...collectTextFromCard(inline))
    })
  }

  if (Array.isArray(node.body)) {
    node.body.forEach((item: any) => {
      texts.push(...collectTextFromCard(item))
    })
  }

  if (Array.isArray(node.items)) {
    node.items.forEach((item: any) => {
      texts.push(...collectTextFromCard(item))
    })
  }

  if (Array.isArray(node.columns)) {
    node.columns.forEach((column: any) => {
      texts.push(...collectTextFromCard(column))
    })
  }

  if (Array.isArray(node.actions)) {
    node.actions.forEach((action: any) => {
      texts.push(...collectTextFromCard(action))
    })
  }

  return texts
}

function findSubmitActionData (node: any, title: string): any {
  if (!node || typeof node !== 'object') {
    return null
  }

  if (
    node.type === 'Action.Submit' &&
    typeof node.title === 'string' &&
    node.title.toLowerCase() === title.toLowerCase()
  ) {
    return node.data || null
  }

  if (Array.isArray(node.actions)) {
    for (const action of node.actions) {
      const result = findSubmitActionData(action, title)
      if (result) {
        return result
      }
    }
  }

  if (Array.isArray(node.body)) {
    for (const item of node.body) {
      const result = findSubmitActionData(item, title)
      if (result) {
        return result
      }
    }
  }

  if (Array.isArray(node.items)) {
    for (const item of node.items) {
      const result = findSubmitActionData(item, title)
      if (result) {
        return result
      }
    }
  }

  if (Array.isArray(node.columns)) {
    for (const column of node.columns) {
      const result = findSubmitActionData(column, title)
      if (result) {
        return result
      }
    }
  }

  return null
}

function extractConsentCardInfo (activity: any): ConsentCardInfo | null {
  if (activity?.name !== 'connectors/consentCard') {
    return null
  }

  const attachment = activity?.attachments?.find((item: any) => {
    return item?.contentType === 'application/vnd.microsoft.card.adaptive'
  })

  if (!attachment?.content) {
    return null
  }

  const content = attachment.content
  const allText = collectTextFromCard(content)

  const title = allText.find(text => text.includes('Connect to continue')) || 'Connect to continue'
  const description = allText.find(text => text.includes("I'll use your credentials")) || 'Connector permission is required to continue.'

  let connectorName = 'Connector'

  if (allText.some(text => text.toLowerCase() === 'sharepoint')) {
    connectorName = 'SharePoint'
  } else if (allText.some(text => text.toLowerCase().includes('dataverse'))) {
    connectorName = 'Dataverse'
  } else if (allText.some(text => text.toLowerCase().includes('power automate'))) {
    connectorName = 'Power Automate'
  }

  const permissions =
    allText.find(text => text.includes('Create file')) ||
    allText.find(text => text.includes('This connection can')) ||
    'This connector needs permission to continue.'

  const allowData = findSubmitActionData(content, 'Allow') || {
    action: 'Allow',
    id: 'submit',
    shouldAwaitUserInput: true
  }

  const cancelData = findSubmitActionData(content, 'Cancel') || {
    action: 'Cancel',
    id: 'submit',
    shouldAwaitUserInput: true
  }

  return {
    title,
    connectorName,
    description,
    permissions,
    allowData,
    cancelData,
    replyToId: activity?.id
  }
}

function Chat () {
  let agentsSettings: SampleConnectionSettings

  try {
    agentsSettings = new SampleConnectionSettings()

    if (!agentsSettings.authority) {
      agentsSettings.authority = 'https://login.microsoftonline.com'
    }
  } catch (error) {
    console.error(error + '\nsettings.js Not Found. Rename settings.EXAMPLE.js to settings.js and fill out necessary fields')
    agentsSettings = {
      appClientId: '',
      tenantId: '',
      environmentId: '',
      schemaName: '',
      directConnectUrl: ''
    } as SampleConnectionSettings
  }

  const [connection, setConnection] = useState<CopilotStudioWebChatConnection | null>(null)
  const [status, setStatus] = useState('Connecting to Agent 1...')
  const [instruction, setInstruction] = useState('I want you to create a customer in F&O add demo values for all the required fields')
  const [feedback, setFeedback] = useState('')
  const [csvOutput, setCsvOutput] = useState('')
  const [agent2Instruction, setAgent2Instruction] = useState('')
  const [currentTestCaseName, setCurrentTestCaseName] = useState('')
  const [fullResponse, setFullResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [consentCard, setConsentCard] = useState<ConsentCardInfo | null>(null)
  const [savedTestCases, setSavedTestCases] = useState<SavedTestCase[]>([])

  const webchatSettings = { showTyping: true }

  useEffect(() => {
    let activitySubscription: any = null
    let cancelled = false

    async function connectToAgent () {
      try {
        const token = await acquireToken(agentsSettings)
        const client = new CopilotStudioClient(agentsSettings, token)
        const newConnection = CopilotStudioWebChat.createConnection(client, webchatSettings)

        if (cancelled) {
          return
        }

        const directLineConnection = newConnection as any

        activitySubscription = directLineConnection.activity$.subscribe((activity: any) => {
          console.log('Incoming activity from Agent:', activity)

          const isFrontendUserActivity = activity?.from?.id === 'frontend-user'
          const rawActivity = stringifyActivity(activity)

          if (!isFrontendUserActivity) {
            setFullResponse(previous => {
              return previous
                ? previous + '\n\n---------------------- RAW ACTIVITY ----------------------\n\n' + rawActivity
                : rawActivity
            })
          }

          const detectedConsentCard = extractConsentCardInfo(activity)

          if (detectedConsentCard && !isFrontendUserActivity) {
            setConsentCard(detectedConsentCard)
            setIsLoading(false)
            setStatus(`${detectedConsentCard.connectorName} permission required. Click Allow to continue.`)
            return
          }

          if (activity?.attachments?.length > 0 && !isFrontendUserActivity) {
            setIsLoading(false)
            setStatus('Agent returned a card/attachment. Check "View full raw Agent 1 response".')
          }

          if (
            activity?.type === 'message' &&
            activity?.text &&
            !isFrontendUserActivity
          ) {
            const botText = activity.text

            const extractedCsv = extractBetween(botText, '---CSV START---', '---CSV END---')
            const extractedAgentInstruction = extractBetween(
              botText,
              '---AGENT2 INSTRUCTION START---',
              '---AGENT2 INSTRUCTION END---'
            )
            const extractedCsvFileName = extractCsvFileName(botText)

            if (extractedCsv) {
              setCsvOutput(extractedCsv)
            }

            if (extractedAgentInstruction) {
              setAgent2Instruction(extractedAgentInstruction)
            }

            if (extractedCsvFileName) {
              setCurrentTestCaseName(extractedCsvFileName)
            } else if (extractedCsv) {
              setCurrentTestCaseName('Generated Test Case')
            }

            setIsLoading(false)
            setStatus('Agent 1 response received. Review the generated output.')
          }
        })

        setConnection(newConnection)
        setStatus('Connected to Agent 1.')
      } catch (error) {
        console.error(error)
        setIsLoading(false)
        setStatus('Failed to connect. Check settings.js, app registration, permissions, and connection string.')
      }
    }

    connectToAgent()

    return () => {
      cancelled = true

      if (activitySubscription) {
        activitySubscription.unsubscribe()
      }
    }
  }, [])

  function sendMessageToAgent (message: string) {
    if (!connection) {
      setStatus('Agent connection is not ready yet.')
      return
    }

    setIsLoading(true)
    setStatus('Sending message to Agent 1...')

    const activity = {
      type: 'message',
      from: {
        id: 'frontend-user',
        name: 'Frontend User',
        role: 'user'
      },
      text: message,
      textFormat: 'plain',
      locale: 'en-US'
    }

    try {
      const directLineConnection = connection as any

      directLineConnection.postActivity(activity).subscribe(
        () => {
          setStatus('Message sent. Waiting for Agent 1 response...')
        },
        (error: any) => {
          console.error('Failed to send message:', error)
          setIsLoading(false)
          setStatus('Failed to send message to Agent 1. Check browser console.')
        }
      )
    } catch (error) {
      console.error('Send message error:', error)
      setIsLoading(false)
      setStatus('Failed to send message to Agent 1. Check browser console.')
    }
  }

  function sendConsentResponse (action: 'Allow' | 'Cancel') {
    if (!connection || !consentCard) {
      setStatus('Consent card is not ready.')
      return
    }

    const selectedData = action === 'Allow' ? consentCard.allowData : consentCard.cancelData

    const activity: any = {
      type: 'message',
      from: {
        id: 'frontend-user',
        name: 'Frontend User',
        role: 'user'
      },
      text: action,
      value: selectedData,
      textFormat: 'plain',
      locale: 'en-US'
    }

    if (consentCard.replyToId) {
      activity.replyToId = consentCard.replyToId
    }

    try {
      const directLineConnection = connection as any

      setIsLoading(true)
      setStatus(`${action} sent. Waiting for Agent 1 to continue...`)

      directLineConnection.postActivity(activity).subscribe(
        () => {
          setConsentCard(null)
          setStatus(`${action} response sent. Waiting for Agent 1 response...`)
        },
        (error: any) => {
          console.error('Failed to send consent response:', error)
          setIsLoading(false)
          setStatus('Failed to send connector permission response. Check browser console.')
        }
      )
    } catch (error) {
      console.error('Consent response error:', error)
      setIsLoading(false)
      setStatus('Failed to send connector permission response. Check browser console.')
    }
  }

  function generateOutput () {
    setCsvOutput('')
    setAgent2Instruction('')
    setCurrentTestCaseName('')
    setFullResponse('')
    setConsentCard(null)

    const message = `
User request:
${instruction}

Generate the CSV test case data and Agent 2 execution instruction.

Important:
- Do not save anything yet.
- Do not call SharePoint yet.
- Do not call Dataverse yet.
- Do not execute test cases.
- Do not call Agent 2.
- Create only the required output for the user request.

Display both outputs and ask for approval.

Use this exact format:

CSV File Name:
<csv-file-name.csv>

Generated CSV Test Cases:

---CSV START---
<valid CSV content>
---CSV END---

Agent 2 Execution Instruction:

---AGENT2 INSTRUCTION START---
<plain text Agent 2 instruction>
---AGENT2 INSTRUCTION END---

Please review the generated CSV test cases and Agent 2 execution instruction. Reply Yes, Approved, Proceed, or Save if you want me to save this. If changes are needed, tell me what to update.
`

    sendMessageToAgent(message)
  }

  function sendChanges () {
    setConsentCard(null)

    const message = `
Please revise the generated outputs based on the following feedback:

${feedback}

Important:
- Do not save anything yet.
- Do not call SharePoint yet.
- Do not call Dataverse yet.
- Do not execute test cases.
- Do not call Agent 2.

Show the revised CSV test cases and Agent 2 execution instruction again for approval.

Use this exact format:

CSV File Name:
<csv-file-name.csv>

Generated CSV Test Cases:

---CSV START---
<valid revised CSV content>
---CSV END---

Agent 2 Execution Instruction:

---AGENT2 INSTRUCTION START---
<revised plain text Agent 2 instruction>
---AGENT2 INSTRUCTION END---
`

    sendMessageToAgent(message)
  }

  function approveAndSave () {
    setConsentCard(null)

    const resolvedName = currentTestCaseName || extractCsvFileName(instruction) || 'Generated Test Case'
    const savedTestCase: SavedTestCase = {
      id: Date.now(),
      name: resolvedName,
      csvContent: csvOutput,
      instruction: agent2Instruction
    }

    setSavedTestCases(previous => [...previous, savedTestCase])
    setStatus(`Saved test case "${resolvedName}" to the list.`)

    const message = `
Approved. Please proceed with saving.

Use the final generated CSV test cases and Agent 2 execution instruction already generated in this conversation.

Now follow the approved save process:
1. Call the Save-Generated-CSV-To-SharePoint flow first.
2. Pass only:
   - csvFileName
   - csvContent
3. Do not pass Agent 2 instruction to the SharePoint flow.
4. After the SharePoint flow returns the file link, save the Dataverse record using the existing Dataverse tool.
5. Include the CSV content, Agent 2 execution instruction, source prompt, and SharePoint CSV link in Dataverse.

Important:
- Do not execute test cases.
- Do not open Dynamics 365 Finance & Operations.
- Do not use Computer Use.
- Do not call Agent 2.

Final response after saving:
Test script saved successfully.
Script Name:
CSV File Name:
SharePoint CSV Link:
`

    sendMessageToAgent(message)
  }

  function handlePlaySavedTestCase (testCase: SavedTestCase) {
    console.log('Play clicked for saved test case:', testCase)
    setStatus(`Playing saved test case "${testCase.name}".`)
  }

  const canGenerate = Boolean(connection && instruction.trim())
  const canApprove = Boolean(connection && (csvOutput.trim() || agent2Instruction.trim()))
  const canRevise = Boolean(connection && feedback.trim())

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Computer Use Automation POC</div>
          <h1 style={styles.title}>Agent 1 Test Script Generator</h1>
          <p style={styles.subtitle}>
            Generate CSV test case data, review the Agent 2 execution instruction, revise if needed, and save only after approval.
          </p>
        </div>

        <div style={styles.statusCard}>
          <span style={connection ? styles.statusDotConnected : styles.statusDotWaiting}></span>
          <div>
            <div style={styles.statusLabel}>Connection Status</div>
            <div style={styles.statusText}>{status}</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>User Instruction</h2>
            <p style={styles.cardDescription}>Enter the business scenario or testing request.</p>

            <textarea
              value={instruction}
              onChange={event => setInstruction(event.target.value)}
              style={styles.instructionBox}
              placeholder='Example: Create a customer in F&O and add demo values for all required fields'
            />

            <div style={styles.buttonRow}>
              <button
                onClick={generateOutput}
                disabled={!canGenerate || isLoading}
                style={!canGenerate || isLoading ? styles.primaryButtonDisabled : styles.primaryButton}
              >
                {isLoading ? 'Generating...' : 'Generate Output'}
              </button>

              <button
                onClick={approveAndSave}
                disabled={!canApprove || isLoading}
                style={!canApprove || isLoading ? styles.successButtonDisabled : styles.successButton}
              >
                Approve & Save
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Feedback / Change Request</h2>
            <p style={styles.cardDescription}>Use this if the generated output needs revision before saving.</p>

            <textarea
              value={feedback}
              onChange={event => setFeedback(event.target.value)}
              style={styles.feedbackBox}
              placeholder='Example: Create only one test case row and use placeholders for missing required values.'
            />

            <button
              onClick={sendChanges}
              disabled={!canRevise || isLoading}
              style={!canRevise || isLoading ? styles.secondaryButtonDisabled : styles.secondaryButton}
            >
              Send Changes
            </button>
          </div>

          {consentCard && (
            <div style={styles.consentCard}>
              <div style={styles.consentIcon}>!</div>
              <h2 style={styles.consentTitle}>{consentCard.title}</h2>
              <p style={styles.consentDescription}>
                Agent 1 needs permission to use <strong>{consentCard.connectorName}</strong> before it can continue the save step.
              </p>
              <p style={styles.consentDescription}>{consentCard.description}</p>

              <div style={styles.permissionBox}>
                <div style={styles.permissionLabel}>Permission request</div>
                <div style={styles.permissionText}>{consentCard.permissions}</div>
              </div>

              <div style={styles.buttonRow}>
                <button
                  onClick={() => sendConsentResponse('Allow')}
                  disabled={isLoading}
                  style={isLoading ? styles.successButtonDisabled : styles.successButton}
                >
                  Allow
                </button>

                <button
                  onClick={() => sendConsentResponse('Cancel')}
                  disabled={isLoading}
                  style={isLoading ? styles.secondaryButtonDisabled : styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <h2 style={styles.cardTitle}>Saved Test Cases</h2>
                <p style={styles.cardDescription}>Each approved save creates a row you can run later.</p>
              </div>
              <span style={styles.outputTag}>Runs</span>
            </div>

            <div style={styles.savedList}>
              {savedTestCases.length === 0 ? (
                <div style={styles.emptyState}>No saved test cases yet. Approve & Save to create one.</div>
              ) : (
                savedTestCases.map(testCase => (
                  <div key={testCase.id} style={styles.savedRow}>
                    <div style={styles.savedRowName}>{testCase.name}</div>
                    <button onClick={() => handlePlaySavedTestCase(testCase)} style={styles.playButton}>
                      ▶
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <h2 style={styles.cardTitle}>Agent 2 Execution Instruction</h2>
                <p style={styles.cardDescription}>Instruction saved for later execution by Agent 2.</p>
              </div>
              <span style={styles.outputTagPurple}>Instruction</span>
            </div>

            <textarea
              value={agent2Instruction}
              onChange={event => setAgent2Instruction(event.target.value)}
              style={styles.agentInstructionBox}
              placeholder='Agent 2 execution instruction will appear here...'
            />
          </div>

          <details style={styles.detailsBox}>
            <summary style={styles.detailsSummary}>View full raw Agent 1 response</summary>
            <textarea
              value={fullResponse}
              readOnly
              style={styles.rawResponseBox}
            />
          </details>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #eefdf8 100%)',
    padding: '28px',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    color: '#0f172a',
    overflowY: 'auto'
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 24px auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'center'
  },
  badge: {
    display: 'inline-block',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  title: {
    margin: '14px 0 8px 0',
    fontSize: '34px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#475569',
    maxWidth: '720px'
  },
  statusCard: {
    minWidth: '310px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    borderRadius: '18px',
    padding: '16px'
  },
  statusDotConnected: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 6px rgba(34,197,94,0.15)'
  },
  statusDotWaiting: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#f59e0b',
    boxShadow: '0 0 0 6px rgba(245,158,11,0.15)'
  },
  statusLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  statusText: {
    marginTop: '4px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 600
  },
  grid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '420px 1fr',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '20px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 18px 45px rgba(15,23,42,0.08)'
  },
  outputCard: {
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '20px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 18px 45px rgba(15,23,42,0.08)'
  },
  consentCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '22px',
    border: '2px solid #bfdbfe',
    boxShadow: '0 18px 45px rgba(37,99,235,0.16)'
  },
  consentIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    marginBottom: '12px'
  },
  consentTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 900,
    color: '#0f172a'
  },
  consentDescription: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5
  },
  permissionBox: {
    marginTop: '14px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px'
  },
  permissionLabel: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  permissionText: {
    fontSize: '13px',
    color: '#0f172a',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap'
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a'
  },
  cardDescription: {
    margin: '6px 0 14px 0',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5
  },
  instructionBox: {
    width: '100%',
    minHeight: '145px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  feedbackBox: {
    width: '100%',
    minHeight: '120px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
    flexWrap: 'wrap'
  },
  primaryButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37,99,235,0.25)'
  },
  primaryButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  successButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(22,163,74,0.25)'
  },
  successButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  secondaryButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(124,58,237,0.25)'
  },
  secondaryButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  cancelButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#64748b',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer'
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start'
  },
  outputTag: {
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#dcfce7',
    color: '#166534',
    fontWeight: 800,
    fontSize: '12px'
  },
  outputTagPurple: {
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#ede9fe',
    color: '#5b21b6',
    fontWeight: 800,
    fontSize: '12px'
  },
  savedList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  savedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  savedRowName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  playButton: {
    border: 'none',
    borderRadius: '999px',
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(37,99,235,0.24)'
  },
  emptyState: {
    padding: '16px',
    borderRadius: '14px',
    border: '1px dashed #cbd5e1',
    background: '#f8fafc',
    color: '#64748b',
    textAlign: 'center',
    fontSize: '14px'
  },
  csvBox: {
    width: '100%',
    minHeight: '230px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.5,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
    background: '#0f172a',
    color: '#e2e8f0'
  },
  agentInstructionBox: {
    width: '100%',
    minHeight: '260px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    lineHeight: 1.6,
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  detailsBox: {
    background: 'rgba(255,255,255,0.90)',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)'
  },
  detailsSummary: {
    cursor: 'pointer',
    fontWeight: 800,
    color: '#334155'
  },
  rawResponseBox: {
    marginTop: '14px',
    width: '100%',
    minHeight: '260px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '12px',
    lineHeight: 1.5,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
    background: '#020617',
    color: '#a7f3d0'
  }
}

export default Chat