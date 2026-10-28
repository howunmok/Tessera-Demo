import { clsx } from 'clsx'
import { BadgeCheck, Mail, Phone, UserRoundPlus, type LucideIcon } from 'lucide-react'
import { mailtoHref, telHref } from '@/utils/contact'
import { getAffiliation, getContactItems, getFirstPhone, getVisibleLinks } from '../card-content'
import { CardAvatar, CardButton, CardCover, CardLogo, ContactRow } from '../CardParts'
import { CardLinks } from '../CardLinks'
import { getCardStyle } from '../card-style'
import type { TemplateProps } from './types'

/** Centered and formal, like a well-printed business card: tracked title, fine rules. */
export function CorporateClassic({ content, mode, onSaveContact }: TemplateProps) {
  const { profile, photo, logo, cover, links, theme } = content
  const live = mode === 'live'
  const firstPhone = getFirstPhone(profile)
  const affiliation = getAffiliation(profile)
  const contacts = getContactItems(profile, live)
  const secondary: { icon: LucideIcon; label: string; href?: string }[] = []
  if (firstPhone) {
    secondary.push({ icon: Phone, label: 'Call', href: live ? telHref(firstPhone) : undefined })
  }
  if (profile.email) {
    secondary.push({
      icon: Mail,
      label: 'Email',
      href: live ? mailtoHref(profile.email) : undefined,
    })
  }
  const hasLinks = getVisibleLinks(links).length > 0

  return (
    <article
      style={getCardStyle(theme)}
      className="overflow-hidden rounded-[1.75rem] bg-(--card-bg) text-(--card-fg) shadow-card ring-1 ring-(--card-line)"
    >
      <CardCover theme={theme} cover={cover} className="h-24">
        {logo && (
          <CardLogo logo={logo} company={profile.company} className="absolute top-3.5 right-3.5" />
        )}
      </CardCover>
      {/* A fine accent rule under the cover, like the edge of an engraved card. */}
      <div aria-hidden className="h-1 bg-(--card-accent)" />

      <div className="px-7 pt-0 pb-7 text-center">
        <div className="relative mx-auto -mt-[3.75rem] w-fit rounded-full p-1 ring-1 ring-(--card-line-strong)">
          <CardAvatar
            photo={photo}
            name={profile.fullName}
            shape={theme.photoShape}
            className="size-24 ring-4 ring-(--card-bg)"
          />
        </div>

        <h2
          className={clsx(
            'mt-5 [font-family:var(--card-font-heading)] text-[1.75rem] leading-tight font-semibold tracking-tight break-words',
            !profile.fullName && 'text-(--card-muted) opacity-50',
          )}
        >
          {profile.fullName || 'Your name'}
        </h2>
        {profile.jobTitle && (
          <p className="mt-2 text-[0.6875rem] font-semibold tracking-[0.2em] text-(--card-accent-text) uppercase">
            {profile.jobTitle}
          </p>
        )}
        {affiliation && (
          <p className="mt-1.5 text-[0.9375rem] text-(--card-muted)">{affiliation}</p>
        )}

        <div aria-hidden className="mx-auto my-5 flex w-36 items-center gap-3">
          <span className="h-px flex-1 bg-(--card-line-strong)" />
          <span className="size-1.5 rotate-45 bg-(--card-accent)" />
          <span className="h-px flex-1 bg-(--card-line-strong)" />
        </div>

        {profile.credential && (
          <p className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-(--card-muted)">
            <BadgeCheck aria-hidden className="size-4 text-(--card-accent-text)" />
            {profile.credential}
          </p>
        )}
        {profile.bio && (
          <p
            className={clsx(
              'mx-auto max-w-[19rem] text-[0.9375rem] leading-relaxed text-(--card-muted)',
              profile.credential && 'mt-3',
            )}
          >
            {profile.bio}
          </p>
        )}

        <div className="mt-6 space-y-2.5">
          <CardButton
            icon={UserRoundPlus}
            label="Save contact"
            variant="solid"
            onClick={onSaveContact}
            className="w-full"
          />
          {secondary.length > 0 && (
            <div className={clsx('grid gap-2.5', secondary.length === 2 && 'grid-cols-2')}>
              {secondary.map((action) => (
                <CardButton key={action.label} {...action} variant="outline" />
              ))}
            </div>
          )}
        </div>
      </div>

      {(contacts.length > 0 || hasLinks) && (
        <div className="border-t border-(--card-line) bg-(--card-surface) px-7 py-6">
          {contacts.length > 0 && (
            <div className="space-y-4">
              {contacts.map((item) => (
                <ContactRow key={item.key} item={item} className="rounded-lg" />
              ))}
            </div>
          )}
          <CardLinks
            links={links}
            live={live}
            variant="divided"
            className={clsx(contacts.length > 0 && 'mt-5 border-t border-(--card-line) pt-2')}
          />
        </div>
      )}
    </article>
  )
}
