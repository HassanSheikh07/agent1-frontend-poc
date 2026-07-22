/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SampleConnectionSettings } from '../settings'
import { acquireTokenForResource } from './acquireToken'
import { FRONTEND_USER, postActivity } from '../lib/directLineClient'

/**
 * Silent SSO for Agent 2.
 *
 * When the OAuth card carries a tokenExchangeResource, acquire a token for that
 * resource via MSAL and post a signin/tokenExchange invoke. Returns true when
 * the exchange was posted, false when the card has no usable exchange data so
 * the caller can fall back to the manual sign-in URL + magic code flow.
 */
export async function tryHandleAgent2TokenExchange(
  oauthCard: any,
  connection: any,
  settings: SampleConnectionSettings
): Promise<boolean> {
  const tokenExchangeResource = oauthCard?.content?.tokenExchangeResource
  const resourceUri = tokenExchangeResource?.uri
  const tokenExchangeId = tokenExchangeResource?.id
  const connectionName = oauthCard?.content?.connectionName

  if (!resourceUri || !tokenExchangeId || !connectionName) {
    console.warn('[Agent 2] OAuth card found, but token exchange data is incomplete.')
    return false
  }

  console.log('[Agent 2] OAuth token exchange requested for:', resourceUri)

  const token = await acquireTokenForResource(settings, resourceUri)

  const tokenExchangeActivity = {
    type: 'invoke',
    name: 'signin/tokenExchange',
    from: FRONTEND_USER,
    value: {
      id: tokenExchangeId,
      connectionName,
      token
    }
  }

  const acceptedId = await postActivity(connection, tokenExchangeActivity)
  console.log('[Agent 2] Token exchange activity accepted:', acceptedId)

  return true
}
