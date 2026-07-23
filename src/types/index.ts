/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * A connector permission prompt raised by Agent 1 (for example SharePoint or
 * Dataverse) that the user must Allow before the save step can continue.
 */
export type ConsentCardInfo = {
  title: string
  connectorName: string
  description: string
  permissions: string
  allowData: any
  cancelData: any
  replyToId?: string
}

/**
 * A generated test case the user approved, kept in memory so it can be replayed
 * against Agent 2 later.
 */
export type SavedTestCase = {
  id: number
  name: string
  csvContent: string
  instruction: string
}

/**
 * The parts of an Agent 1 reply the UI cares about. Every field is optional
 * because Agent 1 sends conversational messages that carry none of them.
 */
export type Agent1Result = {
  csvContent?: string
  agent2Instruction?: string
  testCaseName?: string
}

/**
 * One ordered item from the Agent 2 (CUA) activity stream: a comment and the
 * screenshots that belong to it, e.g.
 *
 * { text: 'Opening Apple iPhone page', screenshots: ['https://...'] }
 */
export type Agent2StreamEntry = {
  id: string
  activityId?: string
  activityType: string
  text?: string
  screenshots: string[]

  /**
   * True when the text mentions a screenshot (e.g. 【11†screenshot】). This does
   * not mean the actual image was included in the activity.
   */
  hasScreenshotReference: boolean

  createdAt: string
}
