/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import JSZip from 'jszip'

import { Agent2StreamEntry } from '../types'

export type ScreenshotArchiveResult = {
  /** Distinct screenshot URLs found in the run. */
  totalScreenshots: number

  /** Screenshots that made it into the ZIP. */
  savedCount: number

  /** URLs that could not be fetched (CORS, auth, network). */
  failedUrls: string[]
}

/**
 * Public CORS Anywhere instance used to reach the Direct Line attachment
 * endpoint, which sends no CORS headers of its own. The public instance is
 * rate limited and requires one-time interactive activation per browser at
 * https://cors-anywhere.herokuapp.com/corsdemo — for anything beyond
 * experimentation, point this at a self-hosted CORS Anywhere instance.
 */
const CORS_PROXY_PREFIX = 'https://cors-anywhere.herokuapp.com/'

const DATA_URL_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]*)$/i
const URL_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|[?#])/i

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg'
}

/**
 * Windows forbids <>:"/\|?* in file names; ZIP folder names inherit those
 * limits once extracted. Trailing dots and spaces are also stripped because
 * Windows drops them silently.
 */
export function sanitizeFolderName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/[. ]+$/g, '')
    .trim()

  return cleaned || 'agent2-run'
}

function extensionFromMime(mime: string): string | null {
  return MIME_EXTENSIONS[mime.toLowerCase()] || null
}

function extensionFromUrl(url: string): string | null {
  const match = URL_EXTENSION_PATTERN.exec(url)

  return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : null
}

/**
 * Orders every distinct screenshot URL by its position in the run. The stream
 * processor dedupes within an entry only, so the same URL attached to two
 * entries is kept once, at its first appearance.
 */
function collectOrderedScreenshotUrls(entries: Agent2StreamEntry[]): string[] {
  const urls = new Set<string>()

  for (const entry of entries) {
    for (const url of entry.screenshots) {
      urls.add(url)
    }
  }

  return Array.from(urls)
}

type FetchedScreenshot = {
  data: ArrayBuffer | string
  isBase64: boolean
  extension: string
}

function isDirectLineAttachmentUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)

    return (
      protocol === 'https:' &&
      (hostname === 'directline.botframework.com' ||
        hostname.endsWith('.botframework.com'))
    )
  } catch {
    return false
  }
}

async function fetchScreenshot(url: string): Promise<FetchedScreenshot> {
  /*
   * data: URLs are decoded locally so a huge inline screenshot never depends
   * on fetch/CSP behavior.
   */
  const dataUrlMatch = DATA_URL_PATTERN.exec(url)

  if (dataUrlMatch) {
    return {
      data: dataUrlMatch[2].replace(/\s+/g, ''),
      isBase64: true,
      extension: extensionFromMime(dataUrlMatch[1]) || 'png'
    }
  }


  const fetchUrl = isDirectLineAttachmentUrl(url)
    ? `${CORS_PROXY_PREFIX}${url}`
    : url

  const response = await fetch(fetchUrl)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''

  return {
    data: await response.arrayBuffer(),
    isBase64: false,
    extension:
      extensionFromMime(contentType.split(';')[0].trim()) ||
      extensionFromUrl(url) ||
      'png'
  }
}

function triggerDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  // Delayed so the click can start streaming the blob before it is revoked.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
}

export async function downloadRunScreenshots(
  testCaseName: string,
  entries: Agent2StreamEntry[]
): Promise<ScreenshotArchiveResult> {
  const urls = collectOrderedScreenshotUrls(entries)

  const result: ScreenshotArchiveResult = {
    totalScreenshots: urls.length,
    savedCount: 0,
    failedUrls: []
  }

  if (urls.length === 0) {
    return result
  }

  const folderName = sanitizeFolderName(testCaseName)
  const zip = new JSZip()
  const folder = zip.folder(folderName)!

  const fetched = await Promise.all(
    urls.map(async url => {
      try {
        return await fetchScreenshot(url)
      } catch (error) {
        console.error('[Agent 2] Failed to fetch screenshot for archive:', url, error)
        return null
      }
    })
  )

  fetched.forEach((screenshot, index) => {
    if (!screenshot) {
      result.failedUrls.push(urls[index])
      return
    }

    result.savedCount += 1

    const fileName = `screenshot-${String(index + 1).padStart(3, '0')}.${screenshot.extension}`

    folder.file(fileName, screenshot.data as any, { base64: screenshot.isBase64 })
  })

  if (result.failedUrls.length > 0) {
    folder.file(
      'failed-screenshots.txt',
      [
        'These screenshot URLs could not be downloaded (auth or CORS may be required):',
        '',
        ...result.failedUrls
      ].join('\n')
    )
  }

  if (result.savedCount === 0 && result.failedUrls.length === 0) {
    return result
  }

  const blob = await zip.generateAsync({ type: 'blob' })

  triggerDownload(blob, `${folderName}.zip`)

  return result
}
