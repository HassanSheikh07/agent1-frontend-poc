/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
*/



import { ConnectionSettings } from '@microsoft/agents-copilotstudio-client'



window.localStorage.debug = 'copilot-studio:*'



export class SampleConnectionSettings extends ConnectionSettings {
  constructor() {
    super({
      // Leave these empty because we are using directConnectUrl
      environmentId: '',
      schemaName: '',



      // Paste the Connection string copied from:
      // Channels → Web app → Microsoft 365 Agents SDK → Connection string
      directConnectUrl: 'https://e1035d94a890eee7868824702427f7.0a.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cr720_Agent1TestScript/conversations?api-version=2022-03-01-preview',
      directConnectUrl2: 'https://e1035d94a890eee7868824702427f7.0a.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cr720_Agent1TestScript/conversations?api-version=2022-03-01-preview',

      // Leave default/empty for normal commercial cloud
      cloud: '',
      customPowerPlatformCloud: '',



      // Published agent
      copilotAgentType: 'Published',



      useExperimentalEndpoint: false
    })



    // App Registration Client ID
    this.appClientId = '0b36118d-8138-44c8-9619-cb78fc72ea8d'



    // Tenant ID where the Copilot Studio agent exists
    this.tenantId = 'cc7374ac-e69f-4e98-942a-1023569972ad'
        this.agent2DirectLineSecret = 'DYqxlNQ5AdHj0YhEflObXfSIuTI0lyqu8VqHlpXxZxKC8ItLRmGRJQQJ99CIACi5YpzAArohAAABAZBS4CbI.44AfMhYWK1yoCfdPZ3Vjpe5TtlpHeph6PSifW2JuPrsFqATi0iUxJQQJ99CIACi5YpzAArohAAABAZBS436I'


    // Usually keep this empty, or set it explicitly
    this.authority = 'https://login.microsoftonline.com'
  }
}
