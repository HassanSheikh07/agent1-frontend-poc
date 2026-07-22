// import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'
// import { CopilotStudioClient } from '@microsoft/agents-copilotstudio-client'
// import { SampleConnectionSettings } from './settings'

// // INVOKE-scoped token — used to CONNECT to an agent
// export async function acquireToken (settings: SampleConnectionSettings): Promise<string> {
//   const msalInstance = new PublicClientApplication({
//     auth: {
//       clientId: settings.appClientId,
//       authority: `${settings.authority}/${settings.tenantId}`,
//     },
//   })
//   await msalInstance.initialize()

//   const loginRequest = {
//     scopes: [CopilotStudioClient.scopeFromSettings(settings)],
//     redirectUri: window.location.origin,
//   }

//   try {
//     const accounts = await msalInstance.getAllAccounts()
//     if (accounts.length > 0) {
//       const response = await msalInstance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
//       return response.accessToken
//     }
//   } catch (e) {
//     if (!(e instanceof InteractionRequiredAuthError)) throw e
//   }

//   const response = await msalInstance.loginPopup(loginRequest)
//   return response.accessToken
// }

// // EXCHANGE-scoped token — used ONLY for the signin/tokenExchange POST
// export async function acquireExchangeToken (
//   settings: SampleConnectionSettings,
//   exchangeScopeUri: string
// ): Promise<string> {
//   const msalInstance = new PublicClientApplication({
//     auth: {
//       clientId: settings.appClientId,
//       authority: `${settings.authority}/${settings.tenantId}`,
//     },
//   })
//   await msalInstance.initialize()

//   const request = { scopes: [exchangeScopeUri], redirectUri: window.location.origin }

//   try {
//     const accounts = await msalInstance.getAllAccounts()
//     if (accounts.length > 0) {
//       const response = await msalInstance.acquireTokenSilent({ ...request, account: accounts[0] })
//       return response.accessToken
//     }
//   } catch (e) {
//     if (!(e instanceof InteractionRequiredAuthError)) throw e
//   }

//   const response = await msalInstance.acquireTokenPopup(request)
//   return response.accessToken
// }

import { CopilotStudioClient } from '@microsoft/agents-copilotstudio-client'
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'

import { SampleConnectionSettings } from './settings'


export async function acquireToken(settings: SampleConnectionSettings): Promise<string> {
  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: settings.appClientId,
      authority: `${settings.authority}/${settings.tenantId}`,
    },
  })
  await msalInstance.initialize()

  const loginRequest = {
    scopes: [CopilotStudioClient.scopeFromSettings(settings)],   // <-- INVOKE scope
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

// EXCHANGE-scoped token — used ONLY for the signin/tokenExchange invoke.
// The resource URI comes from the OAuth card's tokenExchangeResource.uri.
export async function acquireTokenForResource(
  settings: SampleConnectionSettings,
  resourceScope: string
): Promise<string> {
  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: settings.appClientId,
      authority: `${settings.authority}/${settings.tenantId}`,
    },
  })
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