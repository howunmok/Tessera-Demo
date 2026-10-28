#!/usr/bin/env node
/*
 * Checks the PUBLISHED Firestore security rules against your real Firebase project:
 * tries things that must be allowed and things that must be refused, then cleans up.
 *
 *   TEST_EMAIL=you@example.com TEST_PASSWORD=… npm run check:rules
 *
 * - TEST_EMAIL / TEST_PASSWORD: an existing account in the project (a demo account is ideal).
 * - Creates one temporary card (slug "rules-check-…") and deletes it at the end.
 * - For the "other user" checks it signs up a throwaway account (rules-check-…@example.com)
 *   and deletes that account at the end too.
 * Reads the Firebase config from .env. Uses 2 creates, ~10 updates and a few deletes.
 */
import { readFileSync } from 'node:fs'
import { deleteApp, initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  writeBatch,
} from 'firebase/firestore/lite'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^VITE_\w+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
)
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}
const { TEST_EMAIL, TEST_PASSWORD } = process.env
if (!config.projectId || !TEST_EMAIL || !TEST_PASSWORD) {
  console.error('Fill in .env and set TEST_EMAIL and TEST_PASSWORD. See the comment at the top.')
  process.exit(1)
}

// Refused requests are expected here; don't log each one.
setLogLevel('silent')

// Three independent clients: signed out, the owner, and another user.
const apps = {
  anon: initializeApp(config, 'anon'),
  owner: initializeApp(config, 'owner'),
  other: initializeApp(config, 'other'),
}
const db = Object.fromEntries(Object.entries(apps).map(([key, app]) => [key, getFirestore(app)]))

const suffix = Math.random().toString(36).slice(2, 8)
const SLUG = `rules-check-${suffix}`
const SLUG_2 = `rules-check-${suffix}-b`
const results = []
let stoppedEarly = false

async function expect(label, shouldPass, action) {
  let passed
  try {
    await action()
    passed = true
  } catch (error) {
    if (error?.code !== 'permission-denied') {
      results.push({ label, ok: false, note: `unexpected error: ${error?.code ?? error}` })
      return
    }
    passed = false
  }
  results.push({ label, ok: passed === shouldPass, note: passed ? 'allowed' : 'denied' })
}

function validCard(ownerUid, slug) {
  return {
    ownerUid,
    slug,
    label: 'Rules check',
    profile: {
      fullName: 'Rules Check',
      jobTitle: '',
      company: '',
      department: '',
      email: '',
      phones: [],
      address: '',
      bio: '',
      credential: '',
    },
    photo: null,
    logo: null,
    links: [],
    theme: {
      template: 'modern-minimal',
      accent: '#1e3a5f',
      mode: 'light',
      font: 'modern',
      photoShape: 'circle',
      coverType: 'color',
      coverColor: '#1e3a5f',
    },
    qr: {
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      foreground: '#15151c',
      background: '#ffffff',
      gradient: false,
      gradientColor: '#1e3a5f',
      showLogo: false,
    },
    schemaVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

let otherUser
let cardRef
try {
  const owner = (await signInWithEmailAndPassword(getAuth(apps.owner), TEST_EMAIL, TEST_PASSWORD))
    .user
  otherUser = (
    await createUserWithEmailAndPassword(
      getAuth(apps.other),
      `rules-check-${suffix}@example.com`,
      `Rc-${suffix}-${Date.now()}!`,
    )
  ).user

  cardRef = doc(collection(db.owner, 'cards'))
  const card = (key) => doc(db[key], 'cards', cardRef.id)
  const slug = (key, value = SLUG) => doc(db[key], 'slugs', value)
  const update = (fields) => updateDoc(card('owner'), { ...fields, updatedAt: serverTimestamp() })

  // ── Owner: create ──────────────────────────────────────────────────────
  await expect('owner creates a card without claiming its slug', false, () =>
    setDoc(card('owner'), validCard(owner.uid, SLUG)),
  )
  await expect('owner creates a card + claims its slug (one batch)', true, async () => {
    const batch = writeBatch(db.owner)
    batch.set(card('owner'), validCard(owner.uid, SLUG))
    batch.set(slug('owner'), { cardId: cardRef.id, ownerUid: owner.uid })
    await batch.commit()
  })

  // ── Signed out ─────────────────────────────────────────────────────────
  await expect('signed out: read one card', true, () => getDoc(card('anon')))
  await expect('signed out: read a slug', true, () => getDoc(slug('anon')))
  await expect('signed out: list all cards', false, () => getDocs(collection(db.anon, 'cards')))
  await expect('signed out: edit a card', false, () =>
    updateDoc(card('anon'), { label: 'x', updatedAt: serverTimestamp() }),
  )

  // ── Owner: updates ─────────────────────────────────────────────────────
  await expect('owner edits profile', true, () =>
    update({ profile: { ...validCard('', '').profile, fullName: 'Rules Check 2' } }),
  )
  await expect('owner: card name over 60 characters', false, () =>
    update({ label: 'x'.repeat(61) }),
  )
  await expect('owner: unknown template', false, () =>
    update({ theme: { ...validCard('', '').theme, template: 'neon' } }),
  )
  await expect('owner: accent that is not a hex color', false, () =>
    update({ theme: { ...validCard('', '').theme, accent: 'red' } }),
  )
  await expect('owner: unknown QR dot style', false, () =>
    update({ qr: { ...validCard('', '').qr, dotStyle: 'stars' } }),
  )
  await expect('owner: theme without newer fields (older cards)', true, () =>
    update({ 'theme.coverType': deleteField(), 'theme.coverColor': deleteField() }),
  )
  await expect('owner: "photo" that is not an image', false, () =>
    update({ photo: 'data:text/html;base64,PHNjcmlwdD4=' }),
  )
  await expect('owner: extra top-level field', false, () => update({ isAdmin: true }))
  await expect('owner: hand the card to another user', false, () =>
    update({ ownerUid: otherUser.uid }),
  )
  await expect('owner: change slug without claiming it', false, () => update({ slug: SLUG_2 }))
  await expect('owner: change slug (claim new + release old)', true, async () => {
    const batch = writeBatch(db.owner)
    batch.set(slug('owner', SLUG_2), { cardId: cardRef.id, ownerUid: owner.uid })
    batch.update(card('owner'), { slug: SLUG_2, updatedAt: serverTimestamp() })
    batch.delete(slug('owner'))
    await batch.commit()
  })

  // ── Another user ───────────────────────────────────────────────────────
  await expect('other user: edit the card', false, () =>
    updateDoc(card('other'), { label: 'hijacked', updatedAt: serverTimestamp() }),
  )
  await expect('other user: delete the card', false, async () => {
    const batch = writeBatch(db.other)
    batch.delete(card('other'))
    batch.delete(slug('other', SLUG_2))
    await batch.commit()
  })
  await expect('other user: claim a slug pointing at the card', false, () =>
    setDoc(slug('other', `${SLUG}-c`), { cardId: cardRef.id, ownerUid: otherUser.uid }),
  )
  await expect('other user: overwrite the claimed slug', false, () =>
    setDoc(slug('other', SLUG_2), { cardId: 'mine', ownerUid: otherUser.uid }),
  )

  // ── Owner: delete ──────────────────────────────────────────────────────
  await expect('owner deletes the card but keeps its slug', false, () => {
    const batch = writeBatch(db.owner)
    batch.delete(card('owner'))
    return batch.commit()
  })
  await expect('owner deletes the card + releases its slug', true, async () => {
    const batch = writeBatch(db.owner)
    batch.delete(card('owner'))
    batch.delete(slug('owner', SLUG_2))
    await batch.commit()
  })
  cardRef = null
} catch (error) {
  stoppedEarly = true
  const hint =
    error?.code === 'auth/invalid-credential'
      ? ' — check TEST_EMAIL and TEST_PASSWORD (the account must already exist).'
      : ''
  console.error(`Stopped early: ${error?.code ?? error}${hint}`)
} finally {
  if (otherUser)
    await deleteUser(otherUser).catch(() => console.warn('Could not delete the temporary user.'))
  await Promise.all(Object.values(apps).map((app) => deleteApp(app)))
}

const width = Math.max(...results.map((r) => r.label.length))
for (const { label, ok, note } of results) {
  console.log(`${ok ? '✔' : '✘'} ${label.padEnd(width)}  ${note}`)
}
const failed = results.filter((r) => !r.ok).length
if (stoppedEarly) {
  console.log(`\nIncomplete: ${results.length} check(s) ran before the error above.`)
} else {
  console.log(
    failed
      ? `\n${failed} check(s) FAILED — are the latest firestore.rules published?`
      : `\nAll ${results.length} checks passed.`,
  )
}
if (cardRef?.id && results.some((r) => r.label.includes('claims its slug') && r.ok)) {
  console.warn(`Note: test card ${cardRef.id} may need deleting from the Firebase console.`)
}
// Let Node exit on its own once Firebase has closed its connections.
process.exitCode = failed || stoppedEarly ? 1 : 0
