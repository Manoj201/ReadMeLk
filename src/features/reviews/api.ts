import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as qlimit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { docData, listData, reviewDoc, reviewsCol, verifiedReviewId } from '@/lib/firestore'
import { applyReviewDelta, type AggregateFields } from '@/lib/rating'
import type { ContentLang, Rating, Review, TargetType } from '@/types'

const GUEST_COOLDOWN_MS = 10 * 60 * 1000

function cooldownKey(targetId: string) {
  return `readme.guestReview.${targetId}`
}

export function guestCooldownRemaining(targetId: string): number {
  try {
    const raw = localStorage.getItem(cooldownKey(targetId))
    if (!raw) return 0
    const left = GUEST_COOLDOWN_MS - (Date.now() - Number(raw))
    return left > 0 ? left : 0
  } catch {
    return 0
  }
}

function markGuestReview(targetId: string) {
  try {
    localStorage.setItem(cooldownKey(targetId), String(Date.now()))
  } catch {
    /* ignore */
  }
}

function targetRef(targetType: TargetType, targetId: string): DocumentReference<DocumentData> {
  return doc(db, targetType === 'book' ? 'books' : 'authors', targetId)
}

function aggregatesOf(data: DocumentData): AggregateFields {
  return {
    ratingSum: Number(data.ratingSum ?? 0),
    ratingCount: Number(data.ratingCount ?? 0),
    ratingAvg: Number(data.ratingAvg ?? 0),
    bayesianScore: Number(data.bayesianScore ?? 0),
    reviewCount: Number(data.reviewCount ?? 0),
  }
}

export async function fetchReviews(
  targetType: TargetType,
  targetId: string,
  max = 50,
): Promise<Review[]> {
  const snap = await getDocs(
    query(
      reviewsCol,
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      qlimit(max),
    ),
  )
  return listData<Review>(snap)
}

export async function fetchMyReview(targetId: string, uid: string): Promise<Review | null> {
  return docData<Review>(await getDoc(reviewDoc(verifiedReviewId(targetId, uid))))
}

export async function fetchRecentReviews(max = 8): Promise<Review[]> {
  const snap = await getDocs(
    query(
      reviewsCol,
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      qlimit(max),
    ),
  )
  return listData<Review>(snap)
}

export async function fetchReviewsByUser(uid: string, max = 50): Promise<Review[]> {
  const snap = await getDocs(
    query(reviewsCol, where('authorUid', '==', uid), orderBy('createdAt', 'desc'), qlimit(max)),
  )
  return listData<Review>(snap)
}

export interface SubmitReviewInput {
  targetType: TargetType
  targetId: string
  rating: Rating
  titleEn: string | null
  titleSi: string | null
  body: string
  bodyLang: ContentLang
  /** verified path */
  user?: { uid: string; displayName: string }
  /** guest path */
  guestName?: string
}

/**
 * Create or update a review. Every submission lands as `status: 'pending'` and is
 * invisible publicly until an admin approves it (see `approveReview`). Rating
 * aggregates therefore never move here on create — the one exception is a
 * previously *published* review being edited, which must first unwind its old
 * contribution as it drops back to the moderation queue.
 */
export async function submitReview(input: SubmitReviewInput): Promise<void> {
  // Guest path — create-only, random id, never touches the parent aggregates.
  if (!input.user) {
    if (guestCooldownRemaining(input.targetId) > 0) throw new Error('cooldown')
    await setDoc(reviewDoc(doc(reviewsCol).id), {
      targetType: input.targetType,
      targetId: input.targetId,
      bookId: input.targetType === 'book' ? input.targetId : null,
      authorId: input.targetType === 'author' ? input.targetId : null,
      rating: input.rating,
      titleEn: input.titleEn,
      titleSi: input.titleSi,
      body: input.body,
      bodyLang: input.bodyLang,
      isGuest: true,
      authorUid: null,
      reviewerName: input.guestName ?? 'Guest',
      guestName: input.guestName ?? null,
      status: 'pending',
      helpfulCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    markGuestReview(input.targetId)
    return
  }

  const user = input.user
  const rRef = reviewDoc(verifiedReviewId(input.targetId, user.uid))
  const tRef = targetRef(input.targetType, input.targetId)

  await runTransaction(db, async (tx) => {
    const prev = docData<Review>(await tx.get(rRef))

    // A published review being edited must give back its aggregate contribution
    // before it re-enters the queue as pending.
    if (prev?.status === 'published') {
      const tSnap = await tx.get(tRef)
      if (tSnap.exists()) {
        const next = applyReviewDelta(aggregatesOf(tSnap.data() ?? {}), {
          oldRating: prev.rating as Rating,
          isDelete: true,
          isGuest: prev.isGuest,
        })
        tx.update(tRef, { ...next, updatedAt: serverTimestamp() })
      }
    }

    tx.set(rRef, {
      targetType: input.targetType,
      targetId: input.targetId,
      bookId: input.targetType === 'book' ? input.targetId : null,
      authorId: input.targetType === 'author' ? input.targetId : null,
      rating: input.rating,
      titleEn: input.titleEn,
      titleSi: input.titleSi,
      body: input.body,
      bodyLang: input.bodyLang,
      isGuest: false,
      authorUid: user.uid,
      reviewerName: user.displayName,
      guestName: null,
      status: 'pending',
      helpfulCount: prev?.helpfulCount ?? 0,
      createdAt: prev?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

/**
 * Delete a review, unwinding its aggregate contribution only if it was actually
 * counted (i.e. `published`). Pending / removed reviews never moved the aggregates.
 */
export async function deleteReview(review: Review): Promise<void> {
  const tRef = targetRef(review.targetType, review.targetId)
  await runTransaction(db, async (tx) => {
    if (review.status === 'published') {
      const tSnap = await tx.get(tRef)
      if (tSnap.exists()) {
        const next = applyReviewDelta(aggregatesOf(tSnap.data() ?? {}), {
          oldRating: review.rating,
          isDelete: true,
          isGuest: review.isGuest,
        })
        tx.update(tRef, { ...next, updatedAt: serverTimestamp() })
      }
    }
    tx.delete(reviewDoc(review.id))
  })
}

export function buildDistribution(reviews: Review[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  for (const r of reviews) dist[r.rating] += 1
  return dist
}

// re-export for callers that only need the delete-by-id helper
export async function deleteReviewById(id: string): Promise<void> {
  const review = docData<Review>(await getDoc(reviewDoc(id)))
  if (review) await deleteReview(review)
  else await deleteDoc(reviewDoc(id))
}
