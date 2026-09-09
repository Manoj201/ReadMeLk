import {
  collection,
  doc,
  type CollectionReference,
  type DocumentSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AdminAction, AppUser, Author, Book, Report, Review } from '@/types'

/** The stored shape of a document is the app type without its synthetic `id`. */
export type Stored<T extends { id: string }> = Omit<T, 'id'>

function col<T extends { id: string }>(name: string) {
  return collection(db, name) as CollectionReference<Stored<T>>
}

export const usersCol = col<AppUser>('users')
export const authorsCol = col<Author>('authors')
export const booksCol = col<Book>('books')
export const reviewsCol = col<Review>('reviews')
export const reportsCol = col<Report>('reports')
export const adminActionsCol = col<AdminAction>('adminActions')

export const userDoc = (id: string) => doc(usersCol, id)
export const authorDoc = (id: string) => doc(authorsCol, id)
export const bookDoc = (id: string) => doc(booksCol, id)
export const reviewDoc = (id: string) => doc(reviewsCol, id)
export const reportDoc = (id: string) => doc(reportsCol, id)

/** Attach the doc id to a single snapshot (null when the doc is missing). */
export function docData<T extends { id: string }>(
  snap: DocumentSnapshot<Stored<T>>,
): T | null {
  const data = snap.data()
  return data ? ({ id: snap.id, ...data } as T) : null
}

/** Attach doc ids across a query snapshot. */
export function listData<T extends { id: string }>(snap: QuerySnapshot<Stored<T>>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

/** Deterministic id for a signed-in user's review of a target (one per target). */
export const verifiedReviewId = (targetId: string, uid: string) => `${targetId}_${uid}`
