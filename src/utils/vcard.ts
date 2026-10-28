import type { Card, PhoneLabel } from '@/types/card'
import {
  getLinkLabel,
  getLinkValueError,
  isWeChatId,
  normalizeLinkValue,
  resolveLinkType,
  safeLinkHref,
} from './links'

/*
 * vCard 3.0 (RFC 2426) export for "Save contact". Notes:
 * - iOS Contacts doesn't accept WebP photos, so the photo is re-encoded as JPEG.
 * - Links use Apple's grouped "itemN.URL" + "itemN.X-ABLabel" so each keeps its name
 *   (LinkedIn, Portfolio…); other apps still import them as plain URLs.
 * - Lines longer than 75 bytes are folded, as the spec requires.
 */

const PHONE_TYPES: Record<PhoneLabel, string> = {
  mobile: 'CELL,VOICE',
  work: 'WORK,VOICE',
  home: 'HOME,VOICE',
  fax: 'WORK,FAX',
  other: 'VOICE',
}

/** Escapes a text value: backslash, comma, semicolon and line breaks. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n')
}

/** Folds a content line to at most 75 bytes per physical line (UTF-8 safe). */
function foldLine(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    // Continuation lines start with a space, which counts toward their 75 bytes.
    const limit = parts.length === 0 ? 75 : 74
    if (bytes + size > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** "Benny Mok" → family "Mok", given "Benny". Single words become the given name. */
function splitName(fullName: string): { family: string; given: string } {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return { family: '', given: words[0] ?? '' }
  return { family: words[words.length - 1] ?? '', given: words.slice(0, -1).join(' ') }
}

/** Re-encodes an image data URL as a JPEG (base64, without the data: prefix). */
async function toJpegBase64(dataUrl: string, size = 400): Promise<string | null> {
  try {
    const image = new Image()
    image.src = dataUrl
    await image.decode()
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, size / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.round(image.naturalWidth * scale)
    canvas.height = Math.round(image.naturalHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) return null
    context.fillStyle = '#ffffff' // JPEG has no transparency
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.88).split(',')[1] ?? null
  } catch {
    return null
  }
}

export async function buildVCard(card: Card, publicUrl: string): Promise<string> {
  const { profile } = card
  const name = profile.fullName.trim()
  const { family, given } = splitName(name)
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  lines.push(`N:${escapeText(family)};${escapeText(given)};;;`)
  lines.push(`FN:${escapeText(name || profile.company || 'Contact')}`)
  if (profile.company || profile.department) {
    lines.push(`ORG:${escapeText(profile.company)};${escapeText(profile.department)}`)
  }
  if (profile.jobTitle) lines.push(`TITLE:${escapeText(profile.jobTitle)}`)

  for (const phone of profile.phones) {
    const number = phone.number.trim()
    if (number) lines.push(`TEL;TYPE=${PHONE_TYPES[phone.label]}:${escapeText(number)}`)
  }
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeText(profile.email)}`)
  if (profile.address) lines.push(`ADR;TYPE=WORK:;;${escapeText(profile.address)};;;;`)

  // Labelled URLs: the card itself first, then every visible link.
  const urls: { label: string; url: string }[] = [{ label: 'Digital card', url: publicUrl }]
  const notes: string[] = []
  for (const link of card.links) {
    if (!link.visible) continue
    const url = normalizeLinkValue(link.type, link.url)
    const type = resolveLinkType(link.type, url)
    if (!url || getLinkValueError(type, url)) continue
    const label = getLinkLabel({ ...link, url, type })
    if (isWeChatId(type, url)) {
      notes.push(`WeChat ID: ${url}`)
      continue
    }
    const href = safeLinkHref(type, url)
    if (href) urls.push({ label, url: href })
  }
  urls.forEach(({ label, url }, index) => {
    lines.push(`item${String(index + 1)}.URL:${url}`)
    lines.push(`item${String(index + 1)}.X-ABLabel:${escapeText(label)}`)
  })

  const note = [profile.bio, profile.credential, ...notes].filter(Boolean).join('\n')
  if (note) lines.push(`NOTE:${escapeText(note)}`)

  if (card.photo) {
    const jpeg = await toJpegBase64(card.photo)
    if (jpeg) lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${jpeg}`)
  }

  lines.push(`REV:${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`)
  lines.push('END:VCARD')
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/** Downloads the card as a .vcf file. On iPhone/iPad, Safari opens it in Contacts directly. */
export async function downloadVCard(card: Card, publicUrl: string): Promise<void> {
  const vcard = await buildVCard(card, publicUrl)
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const fileName = `${(card.profile.fullName || card.slug).replace(/[\\/:*?"<>|]+/g, '').trim() || 'contact'}.vcf`

  if (isIOS()) {
    // A download attribute would save it to Files; opening it shows "Create New Contact".
    window.location.assign(url)
  } else {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.append(link)
    link.click()
    link.remove()
  }
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60_000)
}
