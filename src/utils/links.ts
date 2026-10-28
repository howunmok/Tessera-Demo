/*
 * Link platforms: detection from a URL, turning what people type ("@benny", "benny.dev",
 * "+1 416 555 0142") into proper URLs, validation, and display helpers.
 * Pure functions — icons and colors live in components/links/platform-icons.ts.
 */

export const LINK_TYPES = [
  'website',
  'linkedin',
  'github',
  'x',
  'instagram',
  'facebook',
  'whatsapp',
  'wechat',
  'calendly',
  'youtube',
  'tiktok',
  'threads',
  'telegram',
  'line',
  'xiaohongshu',
  'bluesky',
  'behance',
  'dribbble',
  'medium',
  'substack',
  'pinterest',
  'spotify',
  'discord',
  'reddit',
  'snapchat',
  'linktree',
  'custom',
] as const

export type LinkType = (typeof LINK_TYPES)[number]

/** Quick-add buttons in the editor, in display order. */
export const PRESET_LINK_TYPES = [
  'website',
  'linkedin',
  'github',
  'x',
  'instagram',
  'facebook',
  'whatsapp',
  'wechat',
  'calendly',
] as const satisfies readonly LinkType[]

interface PlatformInfo {
  name: string
  /** Label filled in when the link is added from a preset button. */
  defaultLabel?: string
  /** Matches the platform's hostnames, for auto-detection. */
  hosts?: RegExp
  /** Builds a profile URL from a bare username, so people can type just "@benny". */
  profileUrl?: (handle: string) => string
  /** Usernames may contain dots ("benny.mok"), so don't mistake them for domains. */
  handleDots?: boolean
  inputLabel?: string
  placeholder?: string
  hint?: string
}

const PLATFORMS: Record<LinkType, PlatformInfo> = {
  website: { name: 'Website', defaultLabel: 'Portfolio', placeholder: 'yourname.com' },
  linkedin: {
    name: 'LinkedIn',
    hosts: /(^|\.)linkedin\.com$|^lnkd\.in$/,
    profileUrl: (handle) => `https://www.linkedin.com/in/${handle}`,
    inputLabel: 'Profile URL or username',
    placeholder: 'linkedin.com/in/your-name',
  },
  github: {
    name: 'GitHub',
    hosts: /(^|\.)github\.com$/,
    profileUrl: (handle) => `https://github.com/${handle}`,
    inputLabel: 'Username or URL',
    placeholder: 'your-username',
  },
  x: {
    name: 'X (Twitter)',
    defaultLabel: 'X',
    hosts: /(^|\.)(x|twitter)\.com$/,
    profileUrl: (handle) => `https://x.com/${handle}`,
    inputLabel: 'Handle or URL',
    placeholder: '@yourhandle',
  },
  instagram: {
    name: 'Instagram',
    hosts: /(^|\.)instagram\.com$|^instagr\.am$/,
    profileUrl: (handle) => `https://www.instagram.com/${handle}`,
    handleDots: true,
    inputLabel: 'Handle or URL',
    placeholder: '@yourhandle',
  },
  facebook: {
    name: 'Facebook',
    hosts: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/,
    profileUrl: (handle) => `https://www.facebook.com/${handle}`,
    handleDots: true,
    inputLabel: 'Page URL or username',
    placeholder: 'facebook.com/your-page',
  },
  whatsapp: {
    name: 'WhatsApp',
    hosts: /(^|\.)(wa\.me|whatsapp\.com)$/,
    inputLabel: 'WhatsApp number',
    placeholder: '+14165550142',
    hint: 'Follows your mobile number unless you change it.',
  },
  wechat: {
    name: 'WeChat',
    hosts: /(^|\.)(wechat\.com|weixin\.qq\.com)$/,
    inputLabel: 'WeChat ID',
    placeholder: 'your-wechat-id',
    hint: 'Visitors can copy it and add you in WeChat.',
  },
  calendly: {
    name: 'Calendly',
    defaultLabel: 'Book a meeting',
    hosts: /(^|\.)calendly\.com$/,
    profileUrl: (handle) => `https://calendly.com/${handle}`,
    inputLabel: 'Booking page URL or username',
    placeholder: 'calendly.com/your-name',
  },
  youtube: {
    name: 'YouTube',
    hosts: /(^|\.)(youtube\.com|youtu\.be)$/,
    profileUrl: (handle) => `https://www.youtube.com/@${handle}`,
    handleDots: true,
  },
  tiktok: {
    name: 'TikTok',
    hosts: /(^|\.)tiktok\.com$/,
    profileUrl: (handle) => `https://www.tiktok.com/@${handle}`,
    handleDots: true,
  },
  threads: {
    name: 'Threads',
    hosts: /(^|\.)threads\.(net|com)$/,
    profileUrl: (handle) => `https://www.threads.net/@${handle}`,
    handleDots: true,
  },
  telegram: {
    name: 'Telegram',
    hosts: /(^|\.)(t\.me|telegram\.me|telegram\.org)$/,
    profileUrl: (handle) => `https://t.me/${handle}`,
  },
  line: { name: 'LINE', hosts: /(^|\.)(line\.me|lin\.ee)$/ },
  xiaohongshu: { name: 'RED (Xiaohongshu)', hosts: /(^|\.)(xiaohongshu\.com|xhslink\.com)$/ },
  bluesky: { name: 'Bluesky', hosts: /(^|\.)bsky\.app$/ },
  behance: { name: 'Behance', hosts: /(^|\.)behance\.net$/ },
  dribbble: { name: 'Dribbble', hosts: /(^|\.)dribbble\.com$/ },
  medium: { name: 'Medium', hosts: /(^|\.)medium\.com$/ },
  substack: { name: 'Substack', hosts: /(^|\.)substack\.com$/ },
  pinterest: { name: 'Pinterest', hosts: /(^|\.)pinterest\.[a-z.]+$|^pin\.it$/ },
  spotify: { name: 'Spotify', hosts: /(^|\.)spotify\.com$/ },
  discord: { name: 'Discord', hosts: /(^|\.)(discord\.gg|discord\.com)$/ },
  reddit: { name: 'Reddit', hosts: /(^|\.)reddit\.com$/ },
  snapchat: { name: 'Snapchat', hosts: /(^|\.)snapchat\.com$/ },
  linktree: { name: 'Linktree', hosts: /(^|\.)linktr\.ee$/ },
  custom: { name: 'Link', defaultLabel: '', placeholder: 'example.com/page' },
}

export function getPlatform(type: LinkType) {
  const info = PLATFORMS[type]
  return {
    name: info.name,
    defaultLabel: info.defaultLabel ?? info.name,
    inputLabel: info.inputLabel ?? 'Web address',
    placeholder: info.placeholder ?? 'Paste the link',
    hint: info.hint,
  }
}

const SCHEME = /^[a-z][a-z\d+.-]*:/i
const WECHAT_ID = /^[A-Za-z0-9_-]{5,30}$/

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^[^\s/@]+\.[a-z]{2,}(?:[/?#]|$)/i.test(value)
}

function withProtocol(value: string): string {
  if (SCHEME.test(value)) return value // http(s) stays; anything else fails validation
  return `https://${value.replace(/^\/+/, '')}`
}

/** Parses an http(s) URL with a real-looking hostname, or returns null. */
function parseWebUrl(value: string): URL | null {
  if (/\s/.test(value)) return null
  try {
    const url = new URL(value)
    const validHost = url.hostname.includes('.') && !url.hostname.endsWith('.')
    return (url.protocol === 'https:' || url.protocol === 'http:') && validHost ? url : null
  } catch {
    return null
  }
}

/** True for a WeChat ID (as opposed to a WeChat URL). */
export function isWeChatId(type: LinkType, value: string): boolean {
  return type === 'wechat' && value !== '' && !looksLikeUrl(value)
}

/**
 * Turns what the user typed into the stored value: adds https://, expands handles
 * ("@benny" → instagram.com/benny) and WhatsApp numbers (→ wa.me/14165550142).
 */
export function normalizeLinkValue(type: LinkType, raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  if (type === 'wechat' && !looksLikeUrl(value)) return value.replace(/^@/, '')

  if (type === 'whatsapp' && !looksLikeUrl(value)) {
    const digits = value.replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : value
  }

  const { profileUrl } = PLATFORMS[type]
  if (profileUrl && isHandleInput(type, value)) return profileUrl(value.replace(/^@/, ''))

  return withProtocol(value)
}

/**
 * Whether a value for a profile platform is a username (optionally with a path, like
 * Calendly's "benny/30min") rather than a web address. "benny.mok" counts as an Instagram
 * handle, but as a domain for platforms whose usernames can't contain dots.
 */
function isHandleInput(type: LinkType, value: string): boolean {
  const { hosts, handleDots = false } = PLATFORMS[type]
  if (SCHEME.test(value) || !/^@?[\w.-]+(?:[/?#]\S*)?$/.test(value)) return false
  const first = value.replace(/^@/, '').split(/[/?#]/)[0] ?? ''
  if (hosts?.test(first.toLowerCase())) return false // e.g. "calendly.com/benny"
  const looksLikeDomain = /\.[a-z]{2,}$/i.test(first)
  return !looksLikeDomain || (handleDots && !/[/?#]/.test(value))
}

/** The platform a URL belongs to, or null if it isn't a known one. */
export function detectLinkType(url: string): LinkType | null {
  const parsed = parseWebUrl(url)
  if (!parsed) return null
  const host = parsed.hostname.toLowerCase()
  for (const type of LINK_TYPES) {
    if (PLATFORMS[type].hosts?.test(host)) return type
  }
  return null
}

/**
 * The type to store for a (normalized) value: the detected platform wins, so pasting a
 * GitHub URL into a custom link shows the GitHub icon. Invalid values keep the chosen type,
 * so the field keeps its platform-specific hint while the user fixes it.
 */
export function resolveLinkType(type: LinkType, url: string): LinkType {
  if (!url || isWeChatId(type, url)) return type
  const detected = detectLinkType(url)
  if (detected) return detected
  if (!parseWebUrl(url)) return type
  return type === 'website' ? 'website' : 'custom'
}

/** A user-facing problem with a normalized value, or null. Empty values are allowed (hidden). */
export function getLinkValueError(type: LinkType, url: string): string | null {
  if (!url) return null
  if (isWeChatId(type, url)) {
    return WECHAT_ID.test(url) ? null : 'Use 5–30 letters, numbers, - or _.'
  }
  const parsed = parseWebUrl(url)
  if (!parsed) {
    return type === 'whatsapp'
      ? 'Enter your number with country code, e.g. +1 416 555 0142.'
      : 'Enter a valid web address, e.g. example.com.'
  }
  if (parsed.hostname === 'wa.me') {
    const digits = parsed.pathname.replace(/\D/g, '').length
    if (digits < 8 || digits > 15)
      return 'Enter your number with country code, e.g. +1 416 555 0142.'
  }
  return null
}

/** href for a link, only ever http(s) — never `javascript:` or other schemes. */
export function safeLinkHref(type: LinkType, url: string): string | undefined {
  if (isWeChatId(type, url)) return undefined
  return parseWebUrl(url)?.href
}

/** Short secondary text: "linkedin.com/in/benny", "+14165550142", "ID: bennymok". */
export function getLinkDisplayValue(type: LinkType, url: string): string {
  if (isWeChatId(type, url)) return `ID: ${url}`
  const parsed = parseWebUrl(url)
  if (!parsed) return url
  if (parsed.hostname === 'wa.me') return `+${parsed.pathname.replace(/\D/g, '')}`
  let display = `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}${parsed.search}`
  display = display.replace(/\/$/, '')
  try {
    return decodeURI(display)
  } catch {
    return display
  }
}

/**
 * What the editor's field shows for a stored value. A WhatsApp link is edited as its number
 * ("+16471234567"); it's saved as a wa.me link either way.
 */
export function getEditableLinkValue(type: LinkType, url: string): string {
  if (type !== 'whatsapp') return url
  const parsed = parseWebUrl(url)
  if (parsed?.hostname !== 'wa.me' || parsed.search) return url
  return `+${parsed.pathname.replace(/\D/g, '')}`
}

/** The label to show: the user's own, else the platform name (or the site's hostname). */
export function getLinkLabel(link: { type: LinkType; label: string; url: string }): string {
  if (link.label.trim()) return link.label.trim()
  if (link.type === 'custom' || link.type === 'website') {
    const host = parseWebUrl(link.url)?.hostname.replace(/^www\./, '')
    if (host) return host
  }
  return PLATFORMS[link.type].name
}
