import { clsx } from 'clsx'
import { BadgeCheck, Mail, Phone, UserRoundPlus } from 'lucide-react'
import { mailtoHref, telHref } from '@/utils/contact'
import { getAffiliation, getContactItems, getFirstPhone } from '../card-content'
import { ActionTile, CardAvatar, CardCover, CardLogo, ContactRow } from '../CardParts'
import { CardLinks } from '../CardLinks'
import { getCardStyle } from '../card-style'
import type { TemplateProps } from './types'

/** Clean card with a cover band (color or image) and an overlapping photo. */
export function ModernMinimal({ content, mode, onSaveContact }: TemplateProps) {
  const { profile, photo, logo, cover, links, theme } = content
  const live = mode === 'live'
  const firstPhone = getFirstPhone(profile)
  const affiliation = getAffiliation(profile)
  const contacts = getContactItems(profile, live)
  const actionCount = 1 + (firstPhone ? 1 : 0) + (profile.email ? 1 : 0)

  return (
    <article
      style={getCardStyle(theme)}
      className="overflow-hidden rounded-[1.75rem] bg-(--card-bg) text-(--card-fg) shadow-card ring-1 ring-(--card-line)"
    >
      <CardCover theme={theme} cover={cover} className="h-28">
        {/* Top-right, diagonally opposite the photo, so the two never compete. */}
        {logo && (
          <CardLogo logo={logo} company={profile.company} className="absolute top-3.5 right-3.5" />
        )}
      </CardCover>

      <div className="px-6 pb-7">
        <CardAvatar
          photo={photo}
          name={profile.fullName}
          shape={theme.photoShape}
          className="-mt-12 size-24 shadow-soft ring-4 ring-(--card-bg)"
        />

        <h2
          className={clsx(
            'mt-4 [font-family:var(--card-font-heading)] text-[1.625rem] leading-tight font-semibold tracking-tight break-words',
            !profile.fullName && 'text-(--card-muted) opacity-50',
          )}
        >
          {profile.fullName || 'Your name'}
        </h2>
        {profile.jobTitle && (
          <p className="mt-1 text-[0.9375rem] text-(--card-muted)">{profile.jobTitle}</p>
        )}
        {affiliation && (
          <p className="mt-0.5 text-[0.9375rem] font-medium text-(--card-accent-text)">
            {affiliation}
          </p>
        )}
        {profile.credential && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-(--card-tint) px-2.5 py-1 text-xs font-medium text-(--card-accent-text)">
            <BadgeCheck aria-hidden className="size-3.5" />
            {profile.credential}
          </p>
        )}
        {profile.bio && (
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-(--card-muted)">{profile.bio}</p>
        )}

        <div
          className={clsx(
            'mt-6 grid gap-2',
            actionCount === 3 ? 'grid-cols-3' : actionCount === 2 ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {firstPhone && (
            <ActionTile icon={Phone} label="Call" href={live ? telHref(firstPhone) : undefined} />
          )}
          {profile.email && (
            <ActionTile
              icon={Mail}
              label="Email"
              href={live ? mailtoHref(profile.email) : undefined}
            />
          )}
          <ActionTile icon={UserRoundPlus} label="Save contact" onClick={onSaveContact} />
        </div>

        {contacts.length > 0 && (
          <div className="mt-6 divide-y divide-(--card-line) overflow-hidden rounded-2xl border border-(--card-line)">
            {contacts.map((item) => (
              <ContactRow key={item.key} item={item} className="px-4 py-3" />
            ))}
          </div>
        )}

        <CardLinks links={links} live={live} className="mt-6" />
      </div>
    </article>
  )
}
