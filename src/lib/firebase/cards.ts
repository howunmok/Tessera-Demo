import { FirebaseError } from 'firebase/app'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore/lite'
import type { z } from 'zod'
import {
  CARD_SCHEMA_VERSION,
  createDefaultCardContent,
  DEFAULT_QR,
  DEFAULT_THEME,
  EMPTY_PROFILE,
} from '@/config/card-defaults'
import {
  cardContentSchema,
  LIMITS,
  linkSchema,
  profileSchema,
  qrSchema,
  themeSchema,
} from '@/schemas/card'
import type { Card, CardContent, CardLink } from '@/types/card'
import { db } from './firestore'

/*
 * cards/{cardId}  — the card document (see firestore.rules)
 * slugs/{slug}    — { cardId, ownerUid }, reserves a public URL for exactly one card
 * A card and its slug are always written in the same batch.
 */

const cardsCollection = collection(db, 'cards')
const cardRef = (cardId: string) => doc(db, 'cards', cardId)
const slugRef = (slug: string) => doc(db, 'slugs', slug)

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`The link "${slug}" is already taken.`)
  }
}

// ── Reading ───────────────────────────────────────────────────────────────

export async function listMyCards(ownerUid: string): Promise<Card[]> {
  const snapshot = await getDocs(query(cardsCollection, where('ownerUid', '==', ownerUid)))
  return snapshot.docs
    .map((document) => readCard(document.id, document.data()))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export async function getCard(cardId: string): Promise<Card | null> {
  const snapshot = await getDoc(cardRef(cardId))
  return snapshot.exists() ? readCard(snapshot.id, snapshot.data()) : null
}

/** The card a slug points to, or null if the slug is free. */
export async function getSlugOwner(slug: string): Promise<{ cardId: string } | null> {
  const snapshot = await getDoc(slugRef(slug))
  if (!snapshot.exists()) return null
  const cardId: unknown = snapshot.get('cardId')
  return { cardId: typeof cardId === 'string' ? cardId : '' }
}

/** The public card for a slug (/c/:slug), or null if there isn't one. Two reads. */
export async function getCardBySlug(slug: string): Promise<Card | null> {
  const owner = await getSlugOwner(slug)
  if (!owner?.cardId) return null
  const card = await getCard(owner.cardId)
  // A stale slug pointing at a card that has since moved on is treated as not found.
  return card?.slug === slug ? card : null
}

// ── Writing ───────────────────────────────────────────────────────────────

export async function createCard(input: {
  ownerUid: string
  slug: string
  label: string
  fullName: string
  email: string
}): Promise<string> {
  const ref = doc(cardsCollection)
  // `cover` is only written once an image is set, so card creation keeps working under
  // rules published before covers existed.
  const { cover, ...content } = createDefaultCardContent(input)
  const batch = writeBatch(db)
  batch.set(ref, {
    ...content,
    ownerUid: input.ownerUid,
    slug: input.slug,
    schemaVersion: CARD_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(slugRef(input.slug), { cardId: ref.id, ownerUid: input.ownerUid })

  try {
    await batch.commit()
  } catch (error) {
    // Someone may have claimed the slug since it was checked.
    if (isPermissionDenied(error) && (await getSlugOwner(input.slug))) {
      throw new SlugTakenError(input.slug)
    }
    throw error
  }
  return ref.id
}

/** Saves only the sections that changed; the rules validate the merged document. */
export async function updateCardContent(cardId: string, patch: Partial<CardContent>) {
  await updateDoc(cardRef(cardId), { ...patch, updatedAt: serverTimestamp() })
}

/** Moves a card to a new slug: claims the new one and releases the old one atomically. */
export async function changeCardSlug(
  card: Pick<Card, 'id' | 'ownerUid' | 'slug'>,
  newSlug: string,
): Promise<void> {
  const batch = writeBatch(db)
  batch.set(slugRef(newSlug), { cardId: card.id, ownerUid: card.ownerUid })
  batch.update(cardRef(card.id), { slug: newSlug, updatedAt: serverTimestamp() })
  batch.delete(slugRef(card.slug))

  try {
    await batch.commit()
  } catch (error) {
    if (isPermissionDenied(error) && (await getSlugOwner(newSlug))) {
      throw new SlugTakenError(newSlug)
    }
    throw error
  }
}

/** Deletes a card and releases its slug. */
export async function deleteCard(card: Pick<Card, 'id' | 'slug'>): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(cardRef(card.id))
  batch.delete(slugRef(card.slug))
  await batch.commit()
}

// ── Parsing stored documents ──────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0)
}

function parseOr<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value)
  return result.success ? result.data : fallback
}

/**
 * Turns a stored document into a Card. Each section is validated separately and falls back
 * to defaults, so one malformed field never hides the whole card.
 */
/** Links are parsed one by one (a bad link is dropped, not the whole list) and sorted. */
function readLinks(value: unknown): CardLink[] {
  if (!Array.isArray(value)) return []
  return value
    .flatMap((item: unknown) => {
      const result = linkSchema.safeParse(item)
      return result.success ? [result.data] : []
    })
    .sort((a, b) => a.order - b.order)
    .slice(0, LIMITS.links)
}

function readCard(id: string, data: DocumentData): Card {
  const raw = asRecord(data)
  const rawTheme = asRecord(raw.theme)
  const shape = cardContentSchema.shape
  // Cards created before covers existed used the accent color for the cover.
  const legacyCoverColor = typeof rawTheme.accent === 'string' ? rawTheme.accent : undefined
  return {
    id,
    ownerUid: typeof raw.ownerUid === 'string' ? raw.ownerUid : '',
    slug: typeof raw.slug === 'string' ? raw.slug : '',
    schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : CARD_SCHEMA_VERSION,
    createdAt: asDate(raw.createdAt),
    updatedAt: asDate(raw.updatedAt),
    label: parseOr(shape.label, raw.label, ''),
    profile: parseOr(profileSchema, { ...EMPTY_PROFILE, ...asRecord(raw.profile) }, EMPTY_PROFILE),
    photo: parseOr(shape.photo, raw.photo, null),
    logo: parseOr(shape.logo, raw.logo, null),
    cover: parseOr(shape.cover, raw.cover, null),
    links: readLinks(raw.links),
    theme: parseOr(
      themeSchema,
      { ...DEFAULT_THEME, coverColor: legacyCoverColor ?? DEFAULT_THEME.coverColor, ...rawTheme },
      DEFAULT_THEME,
    ),
    qr: parseOr(qrSchema, { ...DEFAULT_QR, ...asRecord(raw.qr) }, DEFAULT_QR),
  }
}

// ── Errors ────────────────────────────────────────────────────────────────

function isPermissionDenied(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === 'permission-denied'
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof SlugTakenError) return error.message
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return import.meta.env.DEV
          ? 'Permission denied — make sure the latest firestore.rules are published (docs/FIREBASE_SETUP.md, step 5).'
          : 'You don’t have permission to do that.'
      case 'unavailable':
      case 'deadline-exceeded':
        return 'Can’t reach the server. Check your connection and try again.'
      case 'resource-exhausted':
        return 'Today’s free usage limit has been reached. Please try again tomorrow.'
      case 'invalid-argument':
        return 'This card couldn’t be saved — it may be too large. Try a smaller photo or logo.'
      case 'not-found':
        return 'This card no longer exists.'
    }
  }
  return 'Something went wrong. Please try again.'
}
