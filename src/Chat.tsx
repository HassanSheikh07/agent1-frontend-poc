/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from 'react'
import { CopilotStudioClient, CopilotStudioWebChat, CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client'

import { acquireToken } from './acquireToken'
import { SampleConnectionSettings } from './settings'

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
  const [fullResponse, setFullResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
          if (
            activity?.type === 'message' &&
            activity?.text &&
            activity?.from?.id !== 'frontend-user'
          ) {
            const botText = activity.text

            setFullResponse(previous => {
              return previous ? previous + '\n\n' + botText : botText
            })

            const extractedCsv = extractBetween(botText, '---CSV START---', '---CSV END---')
            const extractedAgentInstruction = extractBetween(
              botText,
              '---AGENT2 INSTRUCTION START---',
              '---AGENT2 INSTRUCTION END---'
            )

            if (extractedCsv) {
              setCsvOutput(extractedCsv)
            }

            if (extractedAgentInstruction) {
              setAgent2Instruction(extractedAgentInstruction)
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

  function generateOutput () {
    setCsvOutput('')
    setAgent2Instruction('')
    setFullResponse('')

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

  const canGenerate = Boolean(connection && instruction.trim())
  const canApprove = Boolean(connection && csvOutput.trim())
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
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <h2 style={styles.cardTitle}>Generated CSV Test Cases</h2>
                <p style={styles.cardDescription}>Editable CSV output generated by Agent 1.</p>
              </div>
              <span style={styles.outputTag}>CSV</span>
            </div>

            <textarea
              value={csvOutput}
              onChange={event => setCsvOutput(event.target.value)}
              style={styles.csvBox}
              placeholder='Generated CSV will appear here...'
            />
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
    minHeight: '180px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.5,
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  }
}

export default Chat