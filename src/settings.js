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
      directConnectUrl: 'https://20bbbb7691c1efdebf328a54683361.04.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cr720_Agent1TestScript/conversations?api-version=2022-03-01-preview',
      directConnectUrl2: 'https://20bbbb7691c1efdebf328a54683361.04.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cr720_Agent2UITesting/conversations?api-version=2022-03-01-preview',

      // Leave default/empty for normal commercial cloud
      cloud: '',
      customPowerPlatformCloud: '',



      // Published agent
      copilotAgentType: 'Published',



      useExperimentalEndpoint: false
    })



    // App Registration Client ID
    this.appClientId = '5e69a3e2-b3bc-4ae2-8df9-557556be7cd5'



    // Tenant ID where the Copilot Studio agent exists
    this.tenantId = 'edda99bb-bab6-4c4c-8aa1-4b99e8e09c1b'
        this.agent2DirectLineSecret = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4SEJsbkJiYUl5NnJuM0hqTERURXpiTkt6ayIsIng1dCI6IjE4SEJsbkJiYUl5NnJuM0hqTERURXpiTkt6ayIsInR5cCI6IkpXVCJ9.eyJib3QiOiI1MTFjOWRlMC1kZDNiLTAzOTUtZmQ0OS0yMTI4OGM3MzU0YTMiLCJzaXRlIjoiNWhRcWMxOWlCUDQ0dmJHSVdTakRXUzlmdFN1R1FUQjFhM3lsaTN2VlAyN3E0VWdwRWpoc0pRUUo5OUNHQUNySkwzSkFBcm9oQUFBQkFaQlNkTmUxIiwiY29udiI6IkpWblA1eEpsbEtLQ2dWbWh3VDd6NzktdXMiLCJ1c2VyIjoiOTc4YzRiMGYtN2U1MS00ZmQ4LWIxNTItODRkZTlkOGE3MjZiIiwianRpIjoiOERGMTFERUJDQkQzRkNGLWZiYzI1NWEyOGY1MzQ3ZmFiYWMwMmVmMjBjZjVhM2EzIiwic2tpIjoiMSIsIm9hdCI6IjE3ODkzMzUyNDUiLCJuYmYiOjE3ODkzMzUyNDUsImV4cCI6MTc4OTMzODg0NSwiaXNzIjoiaHR0cHM6Ly9kaXJlY3RsaW5lLmJvdGZyYW1ld29yay5jb20vIiwiYXVkIjoiaHR0cHM6Ly9kaXJlY3RsaW5lLmJvdGZyYW1ld29yay5jb20vIn0.N1DXL3mWGixlp3IS2evYJTTD2_lzZU2hfG5EZQ8MD26EjbSniP5hSaUaIik8dGOTaUHOGsk-zr4-9KrfL8bJ07UsjdyYlRZ55UYiw1Ml76vwCzTaoQqu5C-48KyJi-yIxVWZfAocEk0IujcQcjScnwDhAPSTGKNFqXVUEvhbPWVIgPUdhAhbIg6Yetv8mQJSoKZFU7NduntZSdI_-GpH14FHwTiCog4tygAa_nrAzi4O6GyAFZz6JlpIh4h9FoFrHxFkcr6HmVHLptkGnHqathYQYRycdNurHb2hHFStJpQU_PaNNf1nU3IFCfSNltptdDyjFcd9bI24E-qTKQnCfQ'


    // Usually keep this empty, or set it explicitly
    this.authority = 'https://login.microsoftonline.com'
  }
}
