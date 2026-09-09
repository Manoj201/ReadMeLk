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
  return docData<Author>(await getDoc(authorDoc(id)))
}

export async function fetchAuthors(max = 48): Promise<Author[]> {
  const snap = await getDocs(query(authorsCol, orderBy('bayesianScore', 'desc'), qlimit(max)))
  return listData<Author>(snap)
}

export async function fetchTopAuthors(max = 6): Promise<Author[]> {
  const snap = await getDocs(
    query(
      authorsCol,
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

export async function updateAuthorProfile(
  id: string,
  input: Partial<AuthorInput>,
): Promise<void> {
  await updateDoc(authorDoc(id), { ...input, updatedAt: serverTimestamp() })
}

export async function deleteAuthorProfile(id: string): Promise<void> {
  await deleteDoc(authorDoc(id))
}
