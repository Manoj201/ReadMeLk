import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  limit as qlimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { authorDoc, authorsCol, docData, listData, userDoc } from '@/lib/firestore'
import { deleteImageByUrl } from '@/lib/storage'
import { ZERO_AGGREGATE } from '@/lib/rating'
import type { Author, SocialLink } from '@/types'

export interface AuthorInput {
  nameEn: string
  nameSi: string
  bioEn: string
  bioSi: string
  birthYear: number | null
  location: string | null
  website: string | null
  genres: string[]
  socialLinks: SocialLink[]
}

export async function fetchAuthor(id: string): Promise<Author | null> {
  try {
    return docData<Author>(await getDoc(authorDoc(id)))
  } catch (err) {
    // rules deny reads of non-approved profiles to non-owners — treat as "not found"
    if ((err as { code?: string })?.code === 'permission-denied') return null
    throw err
  }
}

export async function fetchAuthors(max = 48): Promise<Author[]> {
  const snap = await getDocs(
    query(
      authorsCol,
      where('status', '==', 'approved'),
      orderBy('bayesianScore', 'desc'),
      qlimit(max),
    ),
  )
  return listData<Author>(snap)
}

export async function fetchTopAuthors(max = 6): Promise<Author[]> {
  const snap = await getDocs(
    query(
      authorsCol,
      where('status', '==', 'approved'),
      where('ratingCount', '>', 0),
      orderBy('ratingCount', 'desc'),
      orderBy('bayesianScore', 'desc'),
      qlimit(max),
    ),
  )
  return listData<Author>(snap)
    .sort((a, b) => b.bayesianScore - a.bayesianScore)
    .slice(0, max)
}

export async function createAuthorProfile(uid: string, input: AuthorInput): Promise<string> {
  const ref = await addDoc(authorsCol, {
    ownerUid: uid,
    photoURL: null,
    coverURL: null,
    status: 'pending',
    verified: false,
    featured: false,
    ...ZERO_AGGREGATE,
    bookCount: 0,
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // link + upgrade role on the user doc
  const uSnap = await getDoc(userDoc(uid))
  const roles = new Set(uSnap.data()?.roles ?? ['reader'])
  roles.add('author')
  await updateDoc(userDoc(uid), {
    roles: [...roles].filter((r) => r === 'reader' || r === 'author'),
    authorProfileId: ref.id,
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** An owner edit sends the profile back through admin approval. */
export async function updateAuthorProfile(
  id: string,
  input: Partial<AuthorInput>,
): Promise<void> {
  await updateDoc(authorDoc(id), { ...input, status: 'pending', updatedAt: serverTimestamp() })
}

export async function deleteAuthorProfile(id: string): Promise<void> {
  const author = await fetchAuthor(id)
  await deleteDoc(authorDoc(id))
  await deleteImageByUrl(author?.photoURL)
  await deleteImageByUrl(author?.coverURL)
}
