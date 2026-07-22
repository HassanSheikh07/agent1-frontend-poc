/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SampleConnectionSettings } from '../settings'

const DEFAULT_AUTHORITY = 'https://login.microsoftonline.com'

/**
 * Builds the Copilot Studio connection settings. settings.js is developer
 * supplied, so a missing or broken file degrades to empty settings instead of
 * taking the whole app down — the UI then reports a failed connection.
 */
export function createConnectionSettings(): SampleConnectionSettings {
  try {
    const settings = new SampleConnectionSettings()

    if (!settings.authority) {
      settings.authority = DEFAULT_AUTHORITY
    }

    return settings
  } catch (error) {
    console.error(error + '\nsettings.js Not Found. Rename settings.EXAMPLE.js to settings.js and fill out necessary fields')

    return {
      appClientId: '',
      tenantId: '',
      environmentId: '',
      schemaName: '',
      directConnectUrl: ''
    } as SampleConnectionSettings
  }
}

/**
 * The Direct Line channel secret used to reach Agent 2. This is the app-level
 * identity that lets the CUA be invoked.
 */
export function getAgent2DirectLineSecret(settings: SampleConnectionSettings): string {
  return (settings as any).agent2DirectLineSecret as string
}
