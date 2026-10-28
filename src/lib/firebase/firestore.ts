import { getFirestore } from 'firebase/firestore/lite'
import { firebaseApp } from './app'

// Firestore Lite: plain REST reads/writes (no realtime listeners or offline cache), about a
// quarter of the full SDK's size. Save errors surface immediately, which keeps the
// autosave indicator honest.
export const db = getFirestore(firebaseApp)
