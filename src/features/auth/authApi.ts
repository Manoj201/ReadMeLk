import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const googleProvider = new GoogleAuthProvider()

export function signInEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
  return cred
}

export function signInGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signOut() {
  return fbSignOut(auth)
}

/** Map a Firebase auth error code to an auth.json error key. */
export function authErrorKey(code: string | undefined): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'errors.invalidEmail'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'errors.wrongPassword'
    case 'auth/email-already-in-use':
      return 'errors.emailInUse'
    case 'auth/weak-password':
      return 'errors.weakPassword'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'errors.popupClosed'
    default:
      return 'errors.generic'
  }
}
