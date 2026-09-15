import { getDoc, getDocs, limit as qlimit, query, where } from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { authorsCol, docData, userDoc } from '@/lib/firestore'
import type { AppUser } from '@/types'
import { transferAuthorOwnership } from './api'

/**
 * If this signed-in user's *verified* email matches an unclaimed author profile's
 * `claimEmail`, transfer that profile (and its books) to them and return the refreshed
 * user doc. A no-op (returns `appUser` unchanged) on any mismatch, an already-linked
 * account, or an unverified email — see 08-security-and-moderation.md for why
 * verification is required. Called on every sign-in from `AuthListener`, so it must
 * never throw into the auth flow.
 *
 * Not logged to `adminActions` — that log is for admin-initiated actions only; this is
 * a user self-service claim.
 */
export async function tryAutoClaimAuthorProfile(
  fbUser: FirebaseUser,
  appUser: AppUser,
): Promise<AppUser> {
  if (!fbUser.emailVerified || !fbUser.email || appUser.authorProfileId) return appUser

  try {
    const snap = await getDocs(
      query(
        authorsCol,
        where('claimEmail', '==', fbUser.email),
        where('ownerUid', '==', null),
        qlimit(1),
      ),
    )
    const match = snap.docs[0]
    if (!match) return appUser

    await transferAuthorOwnership(match.id, fbUser.uid)

    return docData<AppUser>(await getDoc(userDoc(fbUser.uid))) ?? appUser
  } catch (err) {
    console.error('[claim] auto-claim failed', err)
    return appUser
  }
}
