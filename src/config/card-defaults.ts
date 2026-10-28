import type { CardContent, CardProfile, CardTheme, PhoneLabel, QrSettings } from '@/types/card'

/** Bump when the stored shape changes in a way that needs migrating. */
export const CARD_SCHEMA_VERSION = 1

export const PHONE_LABEL_NAMES: Record<PhoneLabel, string> = {
  mobile: 'Mobile',
  work: 'Work',
  home: 'Home',
  fax: 'Fax',
  other: 'Other',
}

/** Country picked for a new phone number (ISO code). */
export const DEFAULT_PHONE_COUNTRY = 'CA'

export const EMPTY_PROFILE: CardProfile = {
  fullName: '',
  jobTitle: '',
  company: '',
  department: '',
  email: '',
  phones: [],
  address: '',
  bio: '',
  credential: '',
}

export const DEFAULT_THEME: CardTheme = {
  template: 'modern-minimal',
  accent: '#1e3a5f',
  mode: 'light',
  font: 'modern',
  photoShape: 'circle',
  coverType: 'color',
  coverColor: '#1e3a5f',
}

export const DEFAULT_QR: QrSettings = {
  dotStyle: 'rounded',
  cornerSquareStyle: 'extra-rounded',
  cornerDotStyle: 'dot',
  foreground: '#15151c',
  background: '#ffffff',
  gradient: false,
  gradientColor: '#1e3a5f',
  showLogo: false,
}

export function createDefaultCardContent(input: {
  label: string
  fullName: string
  email: string
}): CardContent {
  return {
    label: input.label,
    profile: {
      ...EMPTY_PROFILE,
      fullName: input.fullName,
      email: input.email,
      phones: [{ label: 'mobile', number: '' }],
    },
    photo: null,
    logo: null,
    cover: null,
    links: [],
    theme: { ...DEFAULT_THEME },
    qr: { ...DEFAULT_QR },
  }
}
