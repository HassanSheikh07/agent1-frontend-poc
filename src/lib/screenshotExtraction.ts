/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const SCREENSHOT_REFERENCE_PATTERN =
  /【\s*\d+\s*†\s*screenshot\s*】|\[\s*screenshot\s*\]/i

const IMAGE_CONTEXT_KEY_PATTERN =
  /(screenshot|image|thumbnail|contenturl|contenturi|imageurl|mediaurl)/i

const IMAGE_FILE_PATTERN =
  /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|[?#])/i

function isRecord(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Accepts data:/blob: URLs outright; plain http(s) URLs only count as images
 * when they either sit in an image-flavoured spot in the payload or end in an
 * image file extension. This keeps ordinary hyperlinks out of the screenshot
 * list.
 */
function normalizeImageUrl(value: string, imageContext: boolean): string | null {
  const url = value.trim()

  if (!url) {
    return null
  }

  if (/^data:image\//i.test(url)) {
    return url
  }

  if (/^blob:/i.test(url)) {
    return url
  }

  if (/^https?:\/\//i.test(url)) {
    if (imageContext || IMAGE_FILE_PATTERN.test(url)) {
      return url
    }
  }

  return null
}

/**
 * Searches nested data for image URLs.
 *
 * This supports screenshots that may be placed in:
 * - attachment.contentUrl
 * - attachment.content
 * - Adaptive Card Image.url
 * - channelData
 * - value
 * - entities
 */
function collectImageUrls(
  value: any,
  output: Set<string>,
  imageContext = false,
  depth = 0,
  visited = new WeakSet<object>()
): void {
  if (depth > 10 || value == null) {
    return
  }

  if (typeof value === 'string') {
    const imageUrl = normalizeImageUrl(value, imageContext)

    if (imageUrl) {
      output.add(imageUrl)
    }

    return
  }

  if (typeof value !== 'object' || value === null) {
    return
  }

  if (visited.has(value)) {
    return
  }

  visited.add(value)

  if (Array.isArray(value)) {
    for (const item of value) {
      collectImageUrls(item, output, imageContext, depth + 1, visited)
    }

    return
  }

  const record = value as Record<string, any>

  const contentType =
    typeof record.contentType === 'string' ? record.contentType : ''

  const itemType =
    typeof record.type === 'string' ? record.type : ''

  const objectIsImage =
    imageContext ||
    contentType.toLowerCase().startsWith('image/') ||
    itemType.toLowerCase() === 'image' ||
    itemType.toLowerCase().includes('screenshot')

  for (const [key, childValue] of Object.entries(record)) {
    const keyImpliesImage = IMAGE_CONTEXT_KEY_PATTERN.test(key)

    const childImageContext =
      objectIsImage ||
      keyImpliesImage ||
      (key.toLowerCase() === 'url' && objectIsImage)

    collectImageUrls(childValue, output, childImageContext, depth + 1, visited)
  }
}

export function extractScreenshotUrls(activity: any): string[] {
  const urls = new Set<string>()

  const attachments = Array.isArray(activity?.attachments)
    ? activity.attachments
    : []

  for (const attachment of attachments) {
    if (!isRecord(attachment)) {
      continue
    }

    const contentType =
      typeof attachment.contentType === 'string' ? attachment.contentType : ''

    const attachmentIsImage = contentType.toLowerCase().startsWith('image/')

    if (attachmentIsImage && typeof attachment.contentUrl === 'string') {
      const imageUrl = normalizeImageUrl(attachment.contentUrl, true)

      if (imageUrl) {
        urls.add(imageUrl)
      }
    }

    collectImageUrls(attachment.content, urls, attachmentIsImage)

    /*
     * Some channels place custom screenshot metadata directly on the
     * attachment instead of inside attachment.content.
     */
    collectImageUrls(attachment, urls, attachmentIsImage)
  }

  collectImageUrls(activity?.channelData, urls)
  collectImageUrls(activity?.value, urls)
  collectImageUrls(activity?.entities, urls)

  return Array.from(urls)
}

export function containsScreenshotReference(text?: string): boolean {
  return Boolean(text && SCREENSHOT_REFERENCE_PATTERN.test(text))
}
