import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export class ImageValidationError extends Error {}

function extFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^(jpe?g|png|webp|gif|avif)$/.test(fromName)) return fromName
  const fromType = file.type.split('/').pop()?.toLowerCase()
  return fromType && fromType.length <= 5 ? fromType : 'jpg'
}

export function assertValidImage(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ImageValidationError('File must be an image.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError('Image must be 5 MB or smaller.')
  }
}

/**
 * Upload an image to `${dir}/${name}.<ext>` and return its download URL.
 * The owning Firestore doc must already exist (Storage rules check its ownerUid).
 */
export async function uploadImage(dir: string, name: string, file: File): Promise<string> {
  assertValidImage(file)
  const objectRef = ref(storage, `${dir}/${name}.${extFor(file)}`)
  await uploadBytes(objectRef, file, { contentType: file.type })
  return getDownloadURL(objectRef)
}

export const authorPhotoDir = (authorId: string) => `authorPhotos/${authorId}`
export const bookCoverDir = (bookId: string) => `bookCovers/${bookId}`
