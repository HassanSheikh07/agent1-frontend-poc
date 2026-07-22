/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConsentCardInfo } from '../types'

export const OAUTH_CARD_CONTENT_TYPE = 'application/vnd.microsoft.card.oauth'
export const ADAPTIVE_CARD_CONTENT_TYPE = 'application/vnd.microsoft.card.adaptive'

export function stringifyActivity(activity: any): string {
  try {
    return JSON.stringify(activity, null, 2)
  } catch {
    return String(activity)
  }
}

/**
 * Walks an Adaptive Card and returns every piece of display text it contains,
 * so consent wording can be matched without depending on the card's layout.
 */
export function collectTextFromCard(node: any): string[] {
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

/**
 * Finds the payload of an Action.Submit by its button title, so the UI can
 * replay the exact data the card would have sent.
 */
export function findSubmitActionData(node: any, title: string): any {
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

export function extractConsentCardInfo(activity: any): ConsentCardInfo | null {
  if (activity?.name !== 'connectors/consentCard') {
    return null
  }

  const attachment = activity?.attachments?.find((item: any) => {
    return item?.contentType === ADAPTIVE_CARD_CONTENT_TYPE
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

export function findOAuthCard(activity: any): any | null {
  const oauthCard = activity?.attachments?.find(
    (attachment: any) => attachment?.contentType === OAUTH_CARD_CONTENT_TYPE
  )

  return oauthCard || null
}

/**
 * The sign-in URL shown when an OAuth card cannot be satisfied by a silent
 * token exchange.
 */
export function getSignInUrl(oauthCard: any): string | null {
  const signInButton =
    oauthCard?.content?.buttons?.find((button: any) => button?.type === 'signin') ||
    oauthCard?.content?.buttons?.[0]

  return signInButton?.value || null
}
