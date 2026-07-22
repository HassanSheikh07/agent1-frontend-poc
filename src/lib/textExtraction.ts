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
 * and falling back to "CSV File Name".
 */
export function extractCsvFileName(text: string): string {
  if (!text) {
    return ''
  }

  // Normalize string by removing markdown bolding and replacing escaped JSON newlines
  const cleanText = text.replace(/\\n/g, '\n').replace(/\*\*/g, '')

  // Attempt to find Script Name first
  const scriptNameMatch = cleanText.match(/Script Name:\s*([^\n\r]+)/i)
  if (scriptNameMatch?.[1]) {
    // Remove any trailing commas or quotes from JSON formatting
    return scriptNameMatch[1].replace(/["',]+$/g, '').trim()
  }

  // Fallback to CSV File Name
  const csvFileNameMatch = cleanText.match(/CSV File Name:\s*([^\n\r]+)/i)
  if (csvFileNameMatch?.[1]) {
    // Remove any trailing commas or quotes from JSON formatting
    return csvFileNameMatch[1].replace(/["',]+$/g, '').trim()
  }

  return ''
}
