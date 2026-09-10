import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  limit as qlimit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { authorDoc, bookDoc, booksCol, docData, listData } from '@/lib/firestore'
import { deleteImageByUrl } from '@/lib/storage'
import { ZERO_AGGREGATE } from '@/lib/rating'
import type { Author, Book, BookLang } from '@/types'

export interface BookFilters {
  genre?: string
  language?: BookLang | ''
  minRating?: number
  sort?: 'top' | 'recent'
}

export interface BookInput {
  titleEn: string
  titleSi: string
  descriptionEn: string
  descriptionSi: string
  isbn: string | null
  language: BookLang
  genres: string[]
  publishedYear: number | null
  publisher: string | null
  pageCount: number | null
}

export async function fetchBooks(filters: BookFilters, max = 24): Promise<Book[]> {
  const clauses: QueryConstraint[] = [where('status', '==', 'approved')]
  if (filters.genre) clauses.push(where('genres', 'array-contains', filters.genre))
  if (filters.language) clauses.push(where('language', '==', filters.language))
  if (filters.minRating && filters.minRating > 0) {
    clauses.push(where('ratingAvg', '>=', filters.minRating))
    clauses.push(orderBy('ratingAvg', 'desc'))
  } else if (filters.sort === 'recent') {
    clauses.push(orderBy('createdAt', 'desc'))
  } else {
    clauses.push(orderBy('bayesianScore', 'desc'))
  }
  const snap = await getDocs(query(booksCol, ...clauses, qlimit(max)))
  return listData<Book>(snap)
}

export async function fetchBook(id: string): Promise<Book | null> {
  try {
    return docData<Book>(await getDoc(bookDoc(id)))
  } catch (err) {
    // rules deny reads of non-approved books to non-owners — treat as "not found"
    if ((err as { code?: string })?.code === 'permission-denied') return null
    throw err
  }
}

/**
 * Books by an author. Public callers get approved books only; pass
 * `includeAll` when the viewer owns the profile or is an admin.
 */
export async function fetchBooksByAuthor(
  authorId: string,
  includeAll = false,
): Promise<Book[]> {
  const clauses = [where('authorId', '==', authorId)]
  if (!includeAll) clauses.push(where('status', '==', 'approved'))
  const snap = await getDocs(query(booksCol, ...clauses, orderBy('createdAt', 'desc')))
  return listData<Book>(snap)
}

export async function fetchBestBooks(max = 8): Promise<Book[]> {
  const snap = await getDocs(
    query(
      booksCol,
      where('status', '==', 'approved'),
      where('ratingCount', '>', 0),
      orderBy('ratingCount', 'desc'),
      orderBy('bayesianScore', 'desc'),
      qlimit(max),
    ),
  )
  return listData<Book>(snap)
    .sort((a, b) => b.bayesianScore - a.bayesianScore)
    .slice(0, max)
}

async function loadOwnerAuthor(ownerUid: string, authorId: string | null): Promise<Author> {
  if (!authorId) throw new Error('needAuthorProfile')
  const author = docData<Author>(await getDoc(authorDoc(authorId)))
  if (!author || author.ownerUid !== ownerUid) throw new Error('needAuthorProfile')
  return author
}

export async function createBook(
  ownerUid: string,
  authorId: string | null,
  input: BookInput,
): Promise<string> {
  const author = await loadOwnerAuthor(ownerUid, authorId)
  const ref = await addDoc(booksCol, {
    authorId: author.id,
    authorNameEn: author.nameEn,
    authorNameSi: author.nameSi,
    ownerUid,
    coverURL: null,
    status: 'pending',
    featured: false,
    ...ZERO_AGGREGATE,
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // keep the author's bookCount in step
  await runTransaction(db, async (tx) => {
    const a = await tx.get(authorDoc(author.id))
    if (!a.exists()) return
    tx.update(authorDoc(author.id), {
      bookCount: (a.data().bookCount ?? 0) + 1,
      updatedAt: serverTimestamp(),
    })
  })
  return ref.id
}

/** An owner edit sends the book back through admin approval. */
export async function updateBook(id: string, input: Partial<BookInput>): Promise<void> {
  await updateDoc(bookDoc(id), { ...input, status: 'pending', updatedAt: serverTimestamp() })
}

export async function deleteBook(
  book: Pick<Book, 'id' | 'authorId' | 'coverURL'>,
): Promise<void> {
  await deleteDoc(bookDoc(book.id))
  await deleteImageByUrl(book.coverURL)
  await runTransaction(db, async (tx) => {
    const a = await tx.get(authorDoc(book.authorId))
    if (!a.exists()) return
    tx.update(authorDoc(book.authorId), {
      bookCount: Math.max(0, (a.data().bookCount ?? 0) - 1),
      updatedAt: serverTimestamp(),
    })
  })
}
