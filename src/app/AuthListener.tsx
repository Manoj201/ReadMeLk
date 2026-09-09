import { useEffect } from 'react'
import { onAuthStateChanged, onIdTokenChanged, type User } from 'firebase/auth'
import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { docData, userDoc } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { AppUser } from '@/types'

async function ensureUserDoc(fbUser: User): Promise<AppUser> {
  const ref = userDoc(fbUser.uid)
  const existing = docData<AppUser>(await getDoc(ref))
  if (existing) return existing

  const fresh: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'> = {
    uid: fbUser.uid,
    displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Reader',
    email: fbUser.email ?? '',
    photoURL: fbUser.photoURL ?? null,
    roles: ['reader'],
    authorProfileId: null,
  }
  await setDoc(ref, {
    ...fresh,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return (
    docData<AppUser>(await getDoc(ref)) ?? {
      id: fbUser.uid,
      ...fresh,
      createdAt: null,
      updatedAt: null,
    }
  )
}

/** Single source of auth truth — mount once under the providers. */
export function AuthListener() {
  const { setUser, setStatus, setAdminClaim, reset } = useAuthStore()

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        reset()
        return
      }
      try {
        const appUser = await ensureUserDoc(fbUser)
        setUser(appUser)
        setStatus('authed')
      } catch (err) {
        console.error('[auth] failed to load user doc', err)
        setStatus('authed')
      }
    })

    const unsubToken = onIdTokenChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setAdminClaim(false)
        return
      }
      try {
        const res = await fbUser.getIdTokenResult()
        setAdminClaim(res.claims.admin === true)
      } catch {
        setAdminClaim(false)
      }
    })

    return () => {
      unsubAuth()
      unsubToken()
    }
  }, [setUser, setStatus, setAdminClaim, reset])

  return null
}
