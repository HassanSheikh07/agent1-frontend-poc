/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CopilotStudioClient } from '@microsoft/agents-copilotstudio-client'
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'

import { SampleConnectionSettings } from '../settings'

function createMsalInstance(settings: SampleConnectionSettings): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: settings.appClientId,
      authority: `${settings.authority}/${settings.tenantId}`,
    },
  })
}

/**
 * INVOKE-scoped token — used to CONNECT to an agent.
 */
export async function acquireToken(settings: SampleConnectionSettings): Promise<string> {
  const msalInstance = createMsalInstance(settings)
  await msalInstance.initialize()

  const loginRequest = {
    scopes: [CopilotStudioClient.scopeFromSettings(settings)],
    redirectUri: window.location.origin,
  }

  try {
    const accounts = await msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
      return response.accessToken
    }
  } catch (e) {
    if (!(e instanceof InteractionRequiredAuthError)) throw e
  }

  const response = await msalInstance.loginPopup(loginRequest)
  return response.accessToken
}


export async function acquireTokenForResource(
  settings: SampleConnectionSettings,
  resourceScope: string
): Promise<string> {
  const msalInstance = createMsalInstance(settings)
  await msalInstance.initialize()

  const request = {
    scopes: [resourceScope],
    redirectUri: window.location.origin,
  }

  try {
    const accounts = await msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({ ...request, account: accounts[0] })
      return response.accessToken
    }
  } catch (e) {
    if (!(e instanceof InteractionRequiredAuthError)) throw e
  }

  const response = await msalInstance.acquireTokenPopup(request)
  return response.accessToken
}
