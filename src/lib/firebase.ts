import { initializeApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True when the six required VITE_FIREBASE_* vars are present. */
export const firebaseConfigured = Object.values(config).every(
  (v) => typeof v === 'string' && v.length > 0,
)

const app = initializeApp(
  firebaseConfigured
    ? config
    : // Fallback keeps the app importable in dev/CI without secrets.
      { apiKey: 'demo', projectId: 'readme-demo', appId: 'demo' },
)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

void setPersistence(auth, browserLocalPersistence)

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}
