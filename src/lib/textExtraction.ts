/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Pulls the text between two markers Agent 1 is prompted to emit, such as
 * ---CSV START--- and ---CSV END---.
 */
export function extractBetween(text: string, startMarker: string, endMarker: string): string {
  if (!text) {
    return ''
  }

  const start = text.indexOf(startMarker)
  const end = text.indexOf(endMarker)

  if (start === -1 || end === -1 || end <= start) {
    return ''
  }

  return text.substring(start + startMarker.length, end).trim()
}

/**
 * Reads the test case name out of an Agent 1 reply, preferring "Script Name"
 * and falling back to "CSV File Name". Handles both the "Script Name: value"
 * form and the markdown table form ("| Script Name | value |") used in the
 * final save-confirmation message.
 */
export function extractCsvFileName(text: string): string {
  if (!text) {
    return ''
  }

  // Normalize string by removing markdown bolding and replacing escaped JSON newlines
  const cleanText = text.replace(/\\n/g, '\n').replace(/\*\*/g, '')

  const patterns = [
    /Script Name:\s*([^\n\r]+)/i,
    /\|\s*Script Name\s*\|\s*([^|\n\r]+)\|/i,
    /CSV File Name:\s*([^\n\r]+)/i,
    /\|\s*CSV File Name\s*\|\s*([^|\n\r]+)\|/i
  ]

  for (const pattern of patterns) {
    const match = cleanText.match(pattern)

    if (match?.[1]) {
      // Remove any trailing commas or quotes from JSON formatting
      return match[1].replace(/["',]+$/g, '').trim()
    }
  }

  return ''
}

export function isSaveConfirmationText(text: string): boolean {
  return /test script saved successfully/i.test(text || '')
}
