/**
 * Acquires an Entra ID token scoped to the agent's Token Exchange URL,
 * reusing the account the user already signed in with at launch.
 */
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'
import { SampleConnectionSettings } from './settings'

export async function acquireExchangeToken (
  settings: SampleConnectionSettings,
  exchangeScopeUri: string            // e.g. api://3c53f3ef-.../copilot.studio.scope
): Promise<string> {
  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: settings.appClientId,
      authority: `${settings.authority}/${settings.tenantId}`,
    },
  })
  await msalInstance.initialize()

  const request = {
    scopes: [exchangeScopeUri],
    redirectUri: window.location.origin,
  }

  try {
    const accounts = await msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({ ...request, account: accounts[0] })
      return response.accessToken
    }
  } catch (e) {
    if (!(e instanceof InteractionRequiredAuthError)) {
      throw e
    }
  }

  // First run before admin consent, or silent failure → one interactive consent
  const response = await msalInstance.acquireTokenPopup(request)
  return response.accessToken
}