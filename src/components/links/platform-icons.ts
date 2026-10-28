import { Globe, Link2 } from 'lucide-react'
import type { ComponentType } from 'react'
import { FaLinkedin } from 'react-icons/fa6'
import {
  SiBehance,
  SiBluesky,
  SiCalendly,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiLine,
  SiLinktree,
  SiMedium,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSpotify,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiWechat,
  SiWhatsapp,
  SiX,
  SiXiaohongshu,
  SiYoutube,
} from 'react-icons/si'
import type { LinkType } from '@/utils/links'

type IconComponent = ComponentType<{ className?: string }>

interface PlatformStyle {
  icon: IconComponent
  /** Badge background — the brand color. */
  color: string
  /** Icon color on the badge, for brands whose color is too light for white. */
  iconColor?: string
}

// Generic links use the card's accent (falling back to the app's ink color in the editor).
const ACCENT = 'var(--card-accent, var(--color-ink))'

/**
 * Brand icons from Simple Icons (react-icons/si). LinkedIn's mark was removed from Simple
 * Icons at LinkedIn's request, so it comes from Font Awesome (react-icons/fa6) instead.
 */
export const PLATFORM_STYLES: Record<LinkType, PlatformStyle> = {
  website: { icon: Globe, color: ACCENT },
  custom: { icon: Link2, color: ACCENT },
  linkedin: { icon: FaLinkedin, color: '#0a66c2' },
  github: { icon: SiGithub, color: '#24292f' },
  x: { icon: SiX, color: '#000000' },
  instagram: { icon: SiInstagram, color: '#e4405f' },
  facebook: { icon: SiFacebook, color: '#0866ff' },
  whatsapp: { icon: SiWhatsapp, color: '#25d366' },
  wechat: { icon: SiWechat, color: '#07c160' },
  calendly: { icon: SiCalendly, color: '#006bff' },
  youtube: { icon: SiYoutube, color: '#ff0000' },
  tiktok: { icon: SiTiktok, color: '#000000' },
  threads: { icon: SiThreads, color: '#000000' },
  telegram: { icon: SiTelegram, color: '#26a5e4' },
  line: { icon: SiLine, color: '#06c755' },
  xiaohongshu: { icon: SiXiaohongshu, color: '#ff2442' },
  bluesky: { icon: SiBluesky, color: '#1185fe' },
  behance: { icon: SiBehance, color: '#1769ff' },
  dribbble: { icon: SiDribbble, color: '#ea4c89' },
  medium: { icon: SiMedium, color: '#000000' },
  substack: { icon: SiSubstack, color: '#ff6719' },
  pinterest: { icon: SiPinterest, color: '#bd081c' },
  spotify: { icon: SiSpotify, color: '#1ed760', iconColor: '#000000' },
  discord: { icon: SiDiscord, color: '#5865f2' },
  reddit: { icon: SiReddit, color: '#ff4500' },
  snapchat: { icon: SiSnapchat, color: '#fffc00', iconColor: '#000000' },
  linktree: { icon: SiLinktree, color: '#43e55e', iconColor: '#000000' },
}
