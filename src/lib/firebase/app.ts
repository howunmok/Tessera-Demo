import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirebaseOptions } from './config'

// Auth and Firestore live in separate modules so the public card page can load
// Firestore without pulling in the Auth SDK.
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(getFirebaseOptions())
