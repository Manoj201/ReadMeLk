import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
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

/**
 * App Check — the real defence against scripted abuse of Firestore/Storage on the
 * paid plan. Opt-in: set VITE_APPCHECK_SITE_KEY (reCAPTCHA v3 site key) to enable,
 * then turn on enforcement per service in the Firebase console. In dev, set
 * VITE_APPCHECK_DEBUG_TOKEN (or 'true') to register a debug token.
 */
const appCheckKey = import.meta.env.VITE_APPCHECK_SITE_KEY
if (appCheckKey) {
  const debug = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
  if (import.meta.env.DEV && debug) {
    // @ts-expect-error — self is untyped for this Firebase debug hook
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debug === 'true' ? true : debug
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

void setPersistence(auth, browserLocalPersistence)

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}
