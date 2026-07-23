/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Agent2StreamEntry } from '../types'
import {
  containsScreenshotReference,
  extractScreenshotUrls
} from './screenshotExtraction'

export type Agent2StreamProcessor = {
  /**
   * Folds one Direct Line activity into the ordered entry list. Returns the
   * updated list, or null when the activity carried nothing worth showing.
   */
  process(activity: any): Agent2StreamEntry[] | null
}

function getActivityText(activity: any): string | undefined {
  const text = typeof activity?.text === 'string' ? activity.text.trim() : ''

  return text || undefined
}

function getActivityTimestamp(activity: any): string {
  const timestamp = activity?.timestamp

  if (typeof timestamp === 'string') {
    return timestamp
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }

  return new Date().toISOString()
}

/**
 * Keeps the ordered Agent 2 stream: comments in arrival order, with
 * screenshot-only activities folded into the comment they belong to.
 */
export function createAgent2StreamProcessor(): Agent2StreamProcessor {
  let entries: Agent2StreamEntry[] = []
  let sequence = 0

  function createEntryId(activity: any): string {
    sequence += 1

    const activityId = typeof activity?.id === 'string' ? activity.id : ''

    return activityId
      ? `${activityId}-${sequence}`
      : `stream-entry-${sequence}`
  }

  return {
    process(activity: any): Agent2StreamEntry[] | null {
      /*
       * Ignore the user's own activities. Bot messages and bot/system events
       * remain eligible because screenshots may arrive on non-message types.
       */
      if (activity?.from?.role === 'user') {
        return null
      }

      const text = getActivityText(activity)
      const screenshots = extractScreenshotUrls(activity)
      const hasScreenshotReference = containsScreenshotReference(text)

      // Nothing visible: OAuth cards, typing and status events land here.
      if (!text && screenshots.length === 0 && !hasScreenshotReference) {
        return null
      }

      const activityId = typeof activity?.id === 'string' ? activity.id : undefined
      const activityType = typeof activity?.type === 'string' ? activity.type : 'unknown'
      const replyToId = typeof activity?.replyToId === 'string' ? activity.replyToId : undefined

      /*
       * Normal case: the comment and screenshot are supplied in the same
       * activity.
       */
      if (text) {
        const entry: Agent2StreamEntry = {
          id: createEntryId(activity),
          activityId,
          activityType,
          text,
          screenshots,
          hasScreenshotReference,
          createdAt: getActivityTimestamp(activity)
        }

        entries = [...entries, entry]

        if (hasScreenshotReference && screenshots.length === 0) {
          console.warn(
            '[Agent 2] Screenshot reference received, but no image URL or image data was included in the Direct Line activity.',
            { activityId, text }
          )
        }

        return entries
      }

      /*
       * Screenshot-only activity: pair it with the related comment. First try
       * replyToId; if there is no relationship ID, attach it to the latest
       * comment.
       */
      let targetIndex = -1

      if (replyToId) {
        targetIndex = entries.findIndex(entry => entry.activityId === replyToId)
      }

      if (targetIndex === -1 && entries.length > 0) {
        targetIndex = entries.length - 1
      }

      if (targetIndex >= 0) {
        const target = entries[targetIndex]

        const updatedEntry: Agent2StreamEntry = {
          ...target,
          screenshots: Array.from(new Set([...target.screenshots, ...screenshots]))
        }

        const nextEntries = [...entries]
        nextEntries[targetIndex] = updatedEntry
        entries = nextEntries

        return entries
      }

      /*
       * No earlier comment exists, so preserve the screenshot as an image-only
       * entry.
       */
      const imageOnlyEntry: Agent2StreamEntry = {
        id: createEntryId(activity),
        activityId,
        activityType,
        screenshots,
        hasScreenshotReference,
        createdAt: getActivityTimestamp(activity)
      }

      entries = [...entries, imageOnlyEntry]

      return entries
    }
  }
}
