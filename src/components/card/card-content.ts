import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import { PHONE_LABEL_NAMES } from '@/config/card-defaults'
import type { CardLink, CardProfile, CardTheme } from '@/types/card'
import { mailtoHref, mapsHref, telHref } from '@/utils/contact'
import { getLinkValueError, normalizeLinkValue, resolveLinkType } from '@/utils/links'

/** Shared content helpers, so every template shows the same details the same way. */

export interface ContactItem {
  key: string
  icon: LucideIcon
  label: string
  value: string
  /** Only set on the live card; the editor preview isn't clickable. */
  href?: string
  external?: boolean
}

export function getContactItems(profile: CardProfile, live: boolean): ContactItem[] {
  const items: ContactItem[] = profile.phones
    .filter((phone) => phone.number.trim() !== '')
    .map((phone, index) => ({
      key: `phone-${String(index)}`,
      icon: Phone,
      label: PHONE_LABEL_NAMES[phone.label],
      value: phone.number,
      href: live ? telHref(phone.number) : undefined,
    }))

  if (profile.email) {
    items.push({
      key: 'email',
      icon: Mail,
      label: 'Email',
      value: profile.email,
      href: live ? mailtoHref(profile.email) : undefined,
    })
  }
  if (profile.address) {
    items.push({
      key: 'address',
      icon: MapPin,
      label: 'Office',
      value: profile.address,
      href: live ? mapsHref(profile.address) : undefined,
      external: true,
    })
  }
  return items
}

/** "Commercial Lines · Northwind Insurance" */
export function getAffiliation(profile: CardProfile): string {
  return [profile.department, profile.company].filter(Boolean).join(' · ')
}

export function getFirstPhone(profile: CardProfile): string | undefined {
  return profile.phones.find((phone) => phone.number.trim() !== '')?.number
}

/** Visible, complete links, normalized for display (the editor preview shows them as typed). */
export function getVisibleLinks(links: CardLink[]): CardLink[] {
  return links.flatMap((link) => {
    if (!link.visible) return []
    const url = normalizeLinkValue(link.type, link.url)
    const type = resolveLinkType(link.type, url)
    if (!url || getLinkValueError(type, url)) return []
    return [{ ...link, url, type }]
  })
}

/** True when the cover shows an image (templates add a scrim and use white text). */
export function hasCoverImage(theme: CardTheme, cover: string | null): cover is string {
  return theme.coverType === 'image' && cover !== null
}
