import { clsx } from 'clsx'
import { BadgeCheck, Mail, Phone, UserRoundPlus, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { mailtoHref, telHref } from '@/utils/contact'
import { getAffiliation, getContactItems, getFirstPhone, hasCoverImage } from '../card-content'
import { CardAvatar, CardButton, CardCover, CardLogo, ContactRow } from '../CardParts'
import { CardLinks } from '../CardLinks'
import { getCardStyle, MESH_GRADIENT } from '../card-style'
import type { TemplateProps } from './types'

/** Your name, big, on a rich gradient (or your cover photo), with details on a sheet below. */
export function BoldGradient({ content, mode, onSaveContact }: TemplateProps) {
  const { profile, photo, logo, cover, links, theme } = content
  const live = mode === 'live'
  const firstPhone = getFirstPhone(profile)
  const affiliation = getAffiliation(profile)
  const contacts = getContactItems(profile, live)
  const imageCover = hasCoverImage(theme, cover)

  // Photos get a dark scrim, so text on them is always white.
  const heroStyle = (
    imageCover ? { '--card-on-cover': '#ffffff' } : { background: MESH_GRADIENT }
  ) as CSSProperties

  return (
    <article
      style={getCardStyle(theme)}
      className="overflow-hidden rounded-[1.75rem] bg-(--card-bg) text-(--card-fg) shadow-card ring-1 ring-(--card-line)"
    >
      <CardCover
        theme={theme}
        cover={cover}
        sheen={false}
        style={heroStyle}
        className="px-6 pt-6 pb-16 text-(--card-on-cover)"
      >
        {imageCover ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.18)_0%,rgb(0_0_0/0.38)_45%,rgb(0_0_0/0.75)_100%)]"
          />
        ) : (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full border border-current opacity-[0.12]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-12 size-44 rounded-full border border-current opacity-[0.12]"
            />
          </>
        )}

        <div className="relative flex items-start justify-between gap-3">
          <CardAvatar
            photo={photo}
            name={profile.fullName}
            shape={theme.photoShape}
            className="size-20 shadow-lift ring-2 ring-white/50"
          />
          {logo && <CardLogo logo={logo} company={profile.company} />}
        </div>

        <h2
          className={clsx(
            'relative mt-7 [font-family:var(--card-font-heading)] text-[2rem] leading-[1.05] font-bold tracking-tight break-words',
            !profile.fullName && 'opacity-50',
          )}
        >
          {profile.fullName || 'Your name'}
        </h2>
        {profile.jobTitle && (
          <p className="relative mt-2.5 text-[0.9375rem] font-medium">{profile.jobTitle}</p>
        )}
        {affiliation && <p className="relative mt-0.5 text-sm opacity-85">{affiliation}</p>}
        {profile.credential && (
          <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-current/12 px-3 py-1 text-xs font-semibold ring-1 ring-current/25">
            <BadgeCheck aria-hidden className="size-3.5" />
            {profile.credential}
          </p>
        )}
      </CardCover>

      <div className="relative -mt-9 rounded-t-[1.75rem] bg-(--card-bg) px-6 pt-7 pb-7">
        {profile.bio && (
          <p className="mb-5 text-[0.9375rem] leading-relaxed text-(--card-muted)">{profile.bio}</p>
        )}

        <div className="flex gap-2">
          <CardButton
            icon={UserRoundPlus}
            label="Save contact"
            variant="solid"
            onClick={onSaveContact}
            className="flex-1 rounded-full"
          />
          {firstPhone && (
            <RoundAction icon={Phone} label="Call" href={live ? telHref(firstPhone) : undefined} />
          )}
          {profile.email && (
            <RoundAction
              icon={Mail}
              label="Email"
              href={live ? mailtoHref(profile.email) : undefined}
            />
          )}
        </div>

        {contacts.length > 0 && (
          <div className="mt-6 space-y-2">
            {contacts.map((item) => (
              <ContactRow
                key={item.key}
                item={item}
                className="rounded-2xl bg-(--card-surface) px-4 py-3"
              />
            ))}
          </div>
        )}

        <CardLinks
          links={links}
          live={live}
          variant="filled"
          className={contacts.length > 0 ? 'mt-2' : 'mt-6'}
        />
      </div>
    </article>
  )
}

function RoundAction({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon
  label: string
  href?: string
}) {
  const className =
    'grid size-12 shrink-0 place-items-center rounded-full bg-(--card-tint) text-(--card-accent-text)'
  const content = (
    <>
      <Icon aria-hidden className="size-5" />
      <span className="sr-only">{label}</span>
    </>
  )
  if (!href) return <div className={className}>{content}</div>
  return (
    <a
      href={href}
      title={label}
      className={clsx(className, 'transition-[filter] hover:brightness-95')}
    >
      {content}
    </a>
  )
}
