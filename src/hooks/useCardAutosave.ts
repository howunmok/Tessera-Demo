import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { getFirestoreErrorMessage, updateCardContent } from '@/lib/firebase/cards'
import { cardContentSchema } from '@/schemas/card'
import type { CardContent } from '@/types/card'

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'invalid' | 'error'

const SAVE_DELAY_MS = 1200
const RETRY_DELAY_MS = 8000

const SECTIONS = ['label', 'profile', 'photo', 'logo', 'cover', 'links', 'theme', 'qr'] as const
type Section = (typeof SECTIONS)[number]
type Snapshot = Record<Section, string>

/** Cheap per-section fingerprints, so a save only uploads the parts that changed. */
function takeSnapshot(content: CardContent): Snapshot {
  return {
    label: content.label,
    profile: JSON.stringify(content.profile),
    photo: content.photo ?? '',
    logo: content.logo ?? '',
    cover: content.cover ?? '',
    links: JSON.stringify(content.links),
    theme: JSON.stringify(content.theme),
    qr: JSON.stringify(content.qr),
  }
}

function buildPatch(content: CardContent, changed: Section[]): Partial<CardContent> {
  const patch: Partial<CardContent> = {}
  for (const section of changed) Object.assign(patch, { [section]: content[section] })
  return patch
}

/**
 * Saves the card editor's form to Firestore a moment after the user stops typing.
 * Invalid forms aren't saved (their errors are shown instead); failed saves retry.
 */
export function useCardAutosave(form: UseFormReturn<CardContent>, cardId: string) {
  const [state, setState] = useState<SaveState>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const savedRef = useRef<Snapshot>(takeSnapshot(form.getValues()))
  const timerRef = useRef<number | undefined>(undefined)
  const savingRef = useRef(false)
  const pendingRef = useRef(false)
  const changeCountRef = useRef(0)
  const stateRef = useRef<SaveState>('saved')
  // Lets timers and the retry loop call the latest `save` without a self-reference.
  const saveRef = useRef<() => Promise<void>>(() => Promise.resolve())

  const updateState = useCallback((next: SaveState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const schedule = useCallback((delay: number) => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => void saveRef.current(), delay)
  }, [])

  const save = useCallback(async (): Promise<void> => {
    window.clearTimeout(timerRef.current)
    timerRef.current = undefined
    if (savingRef.current) {
      pendingRef.current = true
      return
    }

    const parsed = cardContentSchema.safeParse(form.getValues())
    if (!parsed.success) {
      updateState('invalid')
      void form.trigger()
      return
    }

    // The array order is what the user arranged; store it in each link's `order` too.
    const content: CardContent = {
      ...parsed.data,
      links: parsed.data.links.map((link, order) => ({ ...link, order })),
    }
    const snapshot = takeSnapshot(content)
    const changed = SECTIONS.filter((section) => snapshot[section] !== savedRef.current[section])
    if (changed.length === 0) {
      updateState('saved')
      return
    }

    const changeCount = changeCountRef.current
    const hadError = stateRef.current === 'error'
    savingRef.current = true
    updateState('saving')

    try {
      await updateCardContent(cardId, buildPatch(content, changed))
      for (const section of changed) savedRef.current[section] = snapshot[section]
      setLastSavedAt(new Date())
      // Edits made while saving are still waiting for their own save.
      updateState(changeCountRef.current === changeCount ? 'saved' : 'unsaved')
    } catch (error) {
      updateState('error')
      if (!hadError) {
        toast.error('Couldn’t save your changes', {
          description: getFirestoreErrorMessage(error),
        })
      }
      schedule(RETRY_DELAY_MS)
    } finally {
      savingRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        void saveRef.current()
      }
    }
  }, [cardId, form, schedule, updateState])

  useEffect(() => {
    saveRef.current = save
  }, [save])

  // Schedule a save after every change.
  useEffect(() => {
    const subscription = form.watch(() => {
      changeCountRef.current += 1
      if (stateRef.current !== 'saving') updateState('unsaved')
      schedule(SAVE_DELAY_MS)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [form, schedule, updateState])

  // Leaving the editor inside the app: save whatever is still pending.
  useEffect(
    () => () => {
      if (timerRef.current !== undefined) void saveRef.current()
    },
    [],
  )

  // Closing the tab with unsaved work: ask the browser to confirm.
  useEffect(() => {
    if (state === 'saved') return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      window.removeEventListener('beforeunload', warn)
    }
  }, [state])

  return { state, lastSavedAt, saveNow: save }
}
