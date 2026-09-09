import {
  addDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as qlimit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  adminActionsCol,
  authorDoc,
  authorsCol,
  bookDoc,
  booksCol,
  docData,
  listData,
  reportDoc,
  reportsCol,
  reviewDoc,
  reviewsCol,
  userDoc,
  usersCol,
} from '@/lib/firestore'
import { applyReviewDelta, type AggregateFields } from '@/lib/rating'
import { deleteBook } from '@/features/books/api'
import { deleteAuthorProfile } from '@/features/authors/api'
import type {
  AdminAction,
  AdminActionType,
  AppUser,
  Author,
  Book,
  Rating,
  Report,
  Review,
} from '@/types'

interface Actor {
  uid: string
  displayName: string
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

async function writeLog(
  actor: Actor,
  action: AdminActionType,
  targetType: AdminAction['targetType'],
  targetId: string,
  note: string | null = null,
) {
  await addDoc(adminActionsCol, {
    actorUid: actor.uid,
    actorName: actor.displayName,
    action,
    targetType,
    targetId,
    note,
    createdAt: serverTimestamp(),
  })
}

/* ---------------- dashboard ---------------- */

export interface AdminStats {
  users: number
  authors: number
  books: number
  reviews: number
  openReports: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const [u, a, b, r, o] = await Promise.all([
    getCountFromServer(usersCol),
    getCountFromServer(authorsCol),
    getCountFromServer(booksCol),
    getCountFromServer(reviewsCol),
    getCountFromServer(query(reportsCol, where('status', '==', 'open'))),
  ])
  return {
    users: u.data().count,
    authors: a.data().count,
    books: b.data().count,
    reviews: r.data().count,
    openReports: o.data().count,
  }
}

export async function fetchRecentActions(max = 20): Promise<AdminAction[]> {
  const snap = await getDocs(query(adminActionsCol, orderBy('createdAt', 'desc'), qlimit(max)))
  return listData<AdminAction>(snap)
}

/* ---------------- reports ---------------- */

export async function fetchOpenReports(): Promise<Report[]> {
  const snap = await getDocs(
    query(reportsCol, where('status', '==', 'open'), orderBy('createdAt', 'asc')),
  )
  return listData<Report>(snap)
}

export async function fetchReviewsForAdmin(status?: Review['status']): Promise<Review[]> {
  const clauses = status ? [where('status', '==', status)] : []
  const snap = await getDocs(
    query(reviewsCol, ...clauses, orderBy('updatedAt', 'desc'), qlimit(100)),
  )
  return listData<Review>(snap)
}

/** Remove or restore a review, unwinding / re-applying its aggregate contribution. */
export async function setReviewRemoved(
  actor: Actor,
  review: Review,
  removed: boolean,
  reportId?: string,
): Promise<void> {
  const tRef = doc(db, review.targetType === 'book' ? 'books' : 'authors', review.targetId)
  await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(tRef)
    if (tSnap.exists()) {
      const next = applyReviewDelta(aggregatesOf(tSnap.data() ?? {}), {
        oldRating: removed ? (review.rating as Rating) : null,
        newRating: removed ? null : (review.rating as Rating),
        isDelete: removed,
        isCreate: !removed,
        isGuest: review.isGuest,
      })
      tx.update(tRef, { ...next, updatedAt: serverTimestamp() })
    }
    tx.update(reviewDoc(review.id), {
      status: removed ? 'removed' : 'published',
      updatedAt: serverTimestamp(),
    })
    if (reportId) {
      tx.update(reportDoc(reportId), {
        status: 'actioned',
        actionedBy: actor.uid,
        actionedAt: serverTimestamp(),
      })
    }
  })
  await writeLog(
    actor,
    removed ? 'review.remove' : 'review.restore',
    'review',
    review.id,
    reportId ? `report:${reportId}` : null,
  )
}

export async function dismissReport(actor: Actor, reportId: string): Promise<void> {
  await updateDoc(reportDoc(reportId), {
    status: 'dismissed',
    actionedBy: actor.uid,
    actionedAt: serverTimestamp(),
  })
  await writeLog(actor, 'report.dismiss', 'report', reportId)
}

/* ---------------- authors ---------------- */

export async function listAuthorsForAdmin(): Promise<Author[]> {
  const snap = await getDocs(query(authorsCol, orderBy('updatedAt', 'desc'), qlimit(100)))
  return listData<Author>(snap)
}

export async function setAuthorVerified(actor: Actor, id: string, verified: boolean) {
  await updateDoc(authorDoc(id), { verified, updatedAt: serverTimestamp() })
  await writeLog(actor, verified ? 'author.verify' : 'author.unverify', 'author', id)
}

export async function setAuthorFeatured(actor: Actor, id: string, featured: boolean) {
  await updateDoc(authorDoc(id), { featured, updatedAt: serverTimestamp() })
  await writeLog(actor, featured ? 'author.feature' : 'author.unfeature', 'author', id)
}

export async function adminDeleteAuthor(actor: Actor, author: Author) {
  await deleteAuthorProfile(author.id)
  await writeLog(actor, 'author.delete', 'author', author.id, author.nameEn || author.nameSi)
}

/* ---------------- books ---------------- */

export async function listBooksForAdmin(): Promise<Book[]> {
  const snap = await getDocs(query(booksCol, orderBy('updatedAt', 'desc'), qlimit(100)))
  return listData<Book>(snap)
}

export async function setBookFeatured(actor: Actor, id: string, featured: boolean) {
  await updateDoc(bookDoc(id), { featured, updatedAt: serverTimestamp() })
  await writeLog(actor, featured ? 'book.feature' : 'book.unfeature', 'book', id)
}

export async function adminDeleteBook(actor: Actor, book: Book) {
  await deleteBook(book)
  await writeLog(actor, 'book.delete', 'book', book.id, book.titleEn || book.titleSi)
}

/* ---------------- users ---------------- */

export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(query(usersCol, orderBy('createdAt', 'desc'), qlimit(100)))
  return listData<AppUser>(snap)
}

export async function setUserAuthorRole(actor: Actor, target: AppUser, grant: boolean) {
  const roles = new Set(target.roles ?? ['reader'])
  if (grant) roles.add('author')
  else roles.delete('author')
  roles.add('reader')
  await updateDoc(userDoc(target.uid), {
    roles: [...roles].filter((r) => r === 'reader' || r === 'author'),
    updatedAt: serverTimestamp(),
  })
  await writeLog(actor, grant ? 'user.grantAuthor' : 'user.revokeAuthor', 'user', target.uid)
}

/* used by the reports view to render the offending review inline */
export async function fetchReviewById(id: string): Promise<Review | null> {
  return docData<Review>(await getDoc(reviewDoc(id)))
}
