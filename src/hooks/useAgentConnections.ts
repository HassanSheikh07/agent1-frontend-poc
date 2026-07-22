/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect, useRef, useState } from 'react'
import {
  CopilotStudioClient,
  CopilotStudioWebChat,
  CopilotStudioWebChatConnection
} from '@microsoft/agents-copilotstudio-client'
import { DirectLine } from 'botframework-directlinejs'

import { acquireToken } from '../auth/acquireToken'
import { tryHandleAgent2TokenExchange } from '../auth/agent2TokenExchange'
import { createConnectionSettings, getAgent2DirectLineSecret } from '../lib/connectionSettings'
import { extractConsentCardInfo, findOAuthCard, getSignInUrl, stringifyActivity } from '../lib/activityUtils'
import { extractBetween, extractCsvFileName } from '../lib/textExtraction'
import { isFrontendUserActivity } from '../lib/directLineClient'
import { SampleConnectionSettings } from '../settings'
import { Agent1Result, ConsentCardInfo } from '../types'

const WEBCHAT_SETTINGS = { showTyping: true }

export interface AgentConnectionHandlers {
  onStatusChange(status: string): void
  onLoadingChange(isLoading: boolean): void
  onRawActivity(rawActivity: string): void
  onConsentCard(consentCard: ConsentCardInfo): void
  onAgent1Result(result: Agent1Result): void
  onAgent2SignInRequired(signInUrl: string): void
  onAgent2SignedIn(): void
  onAgent2Message(text: string): void
}

function extractAgent1Result(botText: string): Agent1Result {
  const csvContent = extractBetween(botText, '---CSV START---', '---CSV END---')
  const agent2Instruction = extractBetween(
    botText,
    '---AGENT2 INSTRUCTION START---',
    '---AGENT2 INSTRUCTION END---'
  )
  const csvFileName = extractCsvFileName(botText)

  return {
    csvContent: csvContent || undefined,
    agent2Instruction: agent2Instruction || undefined,
    testCaseName: csvFileName || (csvContent ? 'Generated Test Case' : undefined)
  }
}

function handleAgent1Activity(activity: any, handlers: AgentConnectionHandlers): void {
  console.log('Incoming activity from Agent:', activity)

  const fromFrontendUser = isFrontendUserActivity(activity)

  if (fromFrontendUser) {
    return
  }

  handlers.onRawActivity(stringifyActivity(activity))

  const consentCard = extractConsentCardInfo(activity)

  if (consentCard) {
    handlers.onConsentCard(consentCard)
    handlers.onLoadingChange(false)
    handlers.onStatusChange(`${consentCard.connectorName} permission required. Click Allow to continue.`)
    return
  }

  if (activity?.attachments?.length > 0) {
    handlers.onLoadingChange(false)
    handlers.onStatusChange('Agent returned a card/attachment. Check "View full raw Agent 1 response".')
  }

  if (activity?.type === 'message' && activity?.text) {
    handlers.onAgent1Result(extractAgent1Result(activity.text))
    handlers.onLoadingChange(false)
    handlers.onStatusChange('Agent 1 response received. Review the generated output.')
  }
}

function handleAgent2Activity(
  activity: any,
  connection: DirectLine,
  settings: SampleConnectionSettings,
  handlers: AgentConnectionHandlers
): void {
  console.log('Incoming activity from Agent 2 (Direct Line):', activity)

 
  const oauthCard = findOAuthCard(activity)

  if (oauthCard) {
    const fallBackToManualSignIn = () => {
      const signInUrl = getSignInUrl(oauthCard)

      if (signInUrl) {
        console.log('Agent 2 sign-in URL:', signInUrl)
        handlers.onAgent2SignInRequired(signInUrl)
      }
    }

    handlers.onStatusChange('Signing in to Agent 2 automatically...')

    tryHandleAgent2TokenExchange(oauthCard, connection, settings)
      .then(exchanged => {
        if (exchanged) {
          handlers.onAgent2SignedIn()
        } else {
          fallBackToManualSignIn()
        }
      })
      .catch((error: any) => {
        console.error('Agent 2 token exchange failed, falling back to manual sign-in:', error)
        fallBackToManualSignIn()
      })

    return
  }


  if (activity?.type === 'message' && activity?.from?.role === 'bot' && activity?.text) {
    handlers.onAgent2Message(activity.text)
  }
}


export function useAgentConnections(handlers: AgentConnectionHandlers) {
  const [settings] = useState<SampleConnectionSettings>(createConnectionSettings)
  const [connection, setConnection] = useState<CopilotStudioWebChatConnection | null>(null)
  const [connection2, setConnection2] = useState<DirectLine | null>(null)

  const handlersRef = useRef<AgentConnectionHandlers>(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    let activitySubscription: any = null
    let activitySubscription2: any = null
    let cancelled = false

    function connectToAgent2() {
      try {
        const secret = getAgent2DirectLineSecret(settings)

        if (!secret) {
          throw new Error('Missing agent2DirectLineSecret in settings.js')
        }

        // The Direct Line channel secret is the app-level identity that lets the
        // CUA be invoked. The CUA uses its own maker-provided credentials for
        // F&O / browser / etc.
        const directLine2 = new DirectLine({ secret })

        if (cancelled) {
          return
        }

        activitySubscription2 = directLine2.activity$.subscribe(
          (activity: any) => {
            handleAgent2Activity(activity, directLine2, settings, handlersRef.current)
          },
          (error: any) => {
            console.error('Agent 2 Direct Line stream error:', error)
          }
        )

        setConnection2(directLine2)
        handlersRef.current.onStatusChange('Connected to Agent 1 and Agent 2.')
      } catch (error) {
        console.error('Failed to connect Agent 2 via Direct Line:', error)
        handlersRef.current.onStatusChange('Agent 1 connected; Agent 2 (Direct Line) failed - check console.')
      }
    }

    async function connectToAgents() {
      try {
        const token = await acquireToken(settings)
        const client = new CopilotStudioClient(settings, token)
        const newConnection = CopilotStudioWebChat.createConnection(client, WEBCHAT_SETTINGS)

        if (cancelled) {
          return
        }

        activitySubscription = (newConnection as any).activity$.subscribe((activity: any) => {
          handleAgent1Activity(activity, handlersRef.current)
        })

        setConnection(newConnection)
        handlersRef.current.onStatusChange('Connected to Agent 1.')

        connectToAgent2()
      } catch (error) {
        console.error(error)
        handlersRef.current.onLoadingChange(false)
        handlersRef.current.onStatusChange('Failed to connect. Check settings.js, app registration, permissions, and connection string.')
      }
    }

    connectToAgents()

    return () => {
      cancelled = true

      if (activitySubscription) {
        activitySubscription.unsubscribe()
      }

      if (activitySubscription2) {
        activitySubscription2.unsubscribe()
      }
    }
  }, [settings])

  return { connection, connection2 }
}
