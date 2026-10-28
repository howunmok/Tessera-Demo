import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ExternalLink, Eye, PenLine } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm, useFormState, useWatch, type Control } from 'react-hook-form'
import { Link, useBlocker, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useCardAutosave } from '@/hooks/useCardAutosave'
import { cardContentSchema } from '@/schemas/card'
import type { Card, CardContent } from '@/types/card'
import { getEditableLinkValue } from '@/utils/links'
import { EditorPreview } from './EditorPreview'
import { findTabWithErrors, isEditorTabId, panelId, tabId, type EditorTabId } from './editor-tabs'
import { EditorTabList } from './EditorTabs'
import { SaveStatus } from './SaveStatus'
import { AboutSection } from './sections/AboutSection'
import { CardSettingsSection } from './sections/CardSettingsSection'
import { ColorsSection } from './sections/ColorsSection'
import { ContactSection } from './sections/ContactSection'
import { DesignSection } from './sections/DesignSection'
import { ImagesSection } from './sections/ImagesSection'
import { LinksSection } from './sections/LinksSection'
import { ProfileSection } from './sections/ProfileSection'
import { QrColorsSection, QrStyleSection } from './sections/QrSection'
import { QrPreviewPanel } from './qr/QrPreviewPanel'

const VIEWS = [
  { value: 'edit', label: 'Edit', icon: <PenLine aria-hidden className="size-4" /> },
  { value: 'preview', label: 'Preview', icon: <Eye aria-hidden className="size-4" /> },
] as const

function pickContent(card: Card): CardContent {
  const { label, profile, photo, logo, cover, links, theme, qr } = card
  const editableLinks = links.map((link) => ({
    ...link,
    url: getEditableLinkValue(link.type, link.url),
  }))
  return { label, profile, photo, logo, cover, links: editableLinks, theme, qr }
}

/** Split editor: form on the left, live preview on the right (tabs on small screens). */
export function CardEditor({ initialCard }: { initialCard: Card }) {
  const [card, setCard] = useState(initialCard)
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  // Start the other view from its top rather than wherever this one was scrolled to.
  const changeView = (next: 'edit' | 'preview') => {
    setView(next)
    window.scrollTo({ top: 0 })
  }
  const form = useForm<CardContent>({
    resolver: zodResolver(cardContentSchema),
    defaultValues: pickContent(initialCard),
    mode: 'onTouched',
  })
  const autosave = useCardAutosave(form, card.id)
  // Subscribed so "Show" (on the save status) can jump to the tab holding an error.
  const { errors } = useFormState({ control: form.control })

  // The open tab lives in the URL (?tab=design), so a reload keeps your place.
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const tab: EditorTabId = isEditorTabId(requestedTab) ? requestedTab : 'details'
  const setTab = (next: EditorTabId) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        params.set('tab', next)
        return params
      },
      { replace: true },
    )
  }

  // Changes that can't be saved yet (invalid, or the server refused) would be lost by
  // leaving the editor. Switching tabs only changes the query string, so it's allowed.
  const unsaveable = autosave.state === 'invalid' || autosave.state === 'error'
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      unsaveable && currentLocation.pathname !== nextLocation.pathname,
  )

  return (
    <FormProvider {...form}>
      <div className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur-md lg:top-16">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-14">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full py-1.5 pr-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span className="max-sm:sr-only">All cards</span>
          </Link>
          <span aria-hidden className="h-5 w-px bg-line-strong" />
          <EditorTitle control={form.control} />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SaveStatus
              state={autosave.state}
              lastSavedAt={autosave.lastSavedAt}
              onRetry={() => void autosave.saveNow()}
              onShowErrors={() => {
                const target = findTabWithErrors(errors)
                if (target) setTab(target)
                changeView('edit')
              }}
            />
            <ButtonLink
              to={`/c/${card.slug}`}
              target="_blank"
              rel="noopener"
              variant="secondary"
              size="sm"
              aria-label="View public card (opens in a new tab)"
            >
              <ExternalLink aria-hidden className="size-4" />
              <span className="max-sm:sr-only">View</span>
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pt-8 lg:pb-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] xl:gap-12">
          <form
            noValidate
            aria-label="Card details"
            onSubmit={(event) => {
              // Enter in a field saves right away instead of waiting for the autosave.
              event.preventDefault()
              void autosave.saveNow()
            }}
            className={view === 'edit' ? 'min-w-0' : 'hidden min-w-0 lg:block'}
          >
            {/* Pinned under the toolbar, so you can switch sections from anywhere on the page. */}
            <div className="sticky top-12 z-10 -mx-4 bg-canvas/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-30 lg:mx-0 lg:px-0">
              <EditorTabList value={tab} onChange={setTab} control={form.control} />
            </div>
            <div
              role="tabpanel"
              id={panelId(tab)}
              aria-labelledby={tabId(tab)}
              className="mt-3 space-y-6"
            >
              {tab === 'details' && (
                <>
                  <ProfileSection />
                  <ImagesSection />
                  <ContactSection />
                  <AboutSection />
                </>
              )}
              {tab === 'links' && <LinksSection />}
              {tab === 'design' && (
                <>
                  <DesignSection />
                  <ColorsSection />
                </>
              )}
              {tab === 'qr' && (
                <>
                  {/* On phones the preview sits on another view, so show the code here too. */}
                  <div className="rounded-card border border-line bg-surface p-5 shadow-xs lg:hidden">
                    <QrPreviewPanel slug={card.slug} cardId={card.id} />
                  </div>
                  <QrStyleSection />
                  <QrColorsSection />
                </>
              )}
              {tab === 'settings' && (
                <CardSettingsSection
                  card={card}
                  onSlugChanged={(slug) => {
                    setCard((current) => ({ ...current, slug }))
                  }}
                />
              )}
            </div>
          </form>

          <aside
            aria-label="Preview"
            className={
              view === 'preview' ? 'lg:sticky lg:top-38' : 'hidden lg:sticky lg:top-38 lg:block'
            }
          >
            {tab === 'qr' ? (
              <QrPreviewPanel slug={card.slug} cardId={card.id} />
            ) : (
              <EditorPreview slug={card.slug} cardId={card.id} />
            )}
          </aside>
        </div>
      </div>

      {/* Phones show the form or the preview; this floats in thumb reach to switch. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <SegmentedControl
          label="Editor view"
          value={view}
          options={VIEWS}
          onChange={changeView}
          className="pointer-events-auto rounded-full bg-surface/85 shadow-lift ring-1 ring-line backdrop-blur-md"
        />
      </div>

      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Leave without saving?"
        description={
          autosave.state === 'invalid'
            ? 'Some fields have errors, so your latest changes haven’t been saved.'
            : 'Your latest changes couldn’t be saved.'
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={() => blocker.proceed?.()}>
              Leave anyway
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">If you leave now, those changes will be lost.</p>
      </Dialog>
    </FormProvider>
  )
}

function EditorTitle({ control }: { control: Control<CardContent> }) {
  const [label, fullName] = useWatch({ control, name: ['label', 'profile.fullName'] })
  return (
    <h1 className="min-w-0 truncate text-[0.9375rem] font-semibold">
      {label || fullName || 'Untitled card'}
    </h1>
  )
}
