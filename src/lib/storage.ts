import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Every image is decoded, downscaled and re-encoded in the browser BEFORE upload.
 * This is both a cost control (smaller objects → less storage + egress on the paid
 * plan) and a safety measure — re-encoding through a canvas produces a guaranteed
 * raster image and drops any embedded script / metadata. Storage rules enforce the
 * same limits server-side. See .claude/planning/07-firebase-setup.md.
 */

/** Raster formats we accept from the file picker. SVG is intentionally excluded. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Hard ceiling on the *picked* file, before we try to decode it. */
export const MAX_PICK_BYTES = 25 * 1024 * 1024

export interface ImageTarget {
  /** longest edge, px — the image is scaled down to fit */
  maxDim: number
  /** maximum size of the re-encoded upload, bytes */
  maxBytes: number
}

export const AVATAR_IMAGE: ImageTarget = { maxDim: 512, maxBytes: 900 * 1024 }
export const COVER_IMAGE: ImageTarget = { maxDim: 1600, maxBytes: 2_600_000 }

export class ImageValidationError extends Error {}

/** Cheap pre-check for the file picker (type allow-list + absurd-size guard). */
export function assertValidImage(file: File): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new ImageValidationError('Use a JPG, PNG or WebP image.')
  }
  if (file.size > MAX_PICK_BYTES) {
    throw new ImageValidationError('That image is too large.')
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Decode → downscale → re-encode (WebP, JPEG fallback), shrinking quality until the
 * result fits `target.maxBytes`. Returns the processed Blob.
 */
export async function processImage(file: File, target: ImageTarget): Promise<Blob> {
  assertValidImage(file)

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new ImageValidationError('That file could not be read as an image.')
  }

  const scale = Math.min(1, target.maxDim / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageValidationError('Image processing is not available.')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  let type = 'image/webp'
  let quality = 0.85
  let blob = await canvasToBlob(canvas, type, quality)
  if (!blob || blob.type !== type) {
    type = 'image/jpeg'
    blob = await canvasToBlob(canvas, type, quality)
  }

  while (blob && blob.size > target.maxBytes && quality > 0.4) {
    quality -= 0.15
    blob = await canvasToBlob(canvas, type, quality)
  }

  if (!blob || blob.size > target.maxBytes) {
    throw new ImageValidationError('Could not compress that image enough — try a smaller one.')
  }
  return blob
}

/**
 * Process `file` and upload it to `${dir}/${name}.<ext>`, returning its download URL.
 * The owning Firestore doc must already exist (Storage rules check its ownerUid).
 */
export async function uploadImage(
  dir: string,
  name: string,
  file: File,
  target: ImageTarget = COVER_IMAGE,
): Promise<string> {
  const blob = await processImage(file, target)
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const objectRef = ref(storage, `${dir}/${name}.${ext}`)
  await uploadBytes(objectRef, blob, {
    contentType: blob.type,
    cacheControl: 'public, max-age=604800, immutable',
  })
  return getDownloadURL(objectRef)
}

/** Best-effort delete of an uploaded object by its download URL or gs:// path. */
export async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  try {
    await deleteObject(ref(storage, url))
  } catch {
    /* object already gone, or not ours — non-fatal */
  }
}

export const authorPhotoDir = (authorId: string) => `authorPhotos/${authorId}`
export const bookCoverDir = (bookId: string) => `bookCovers/${bookId}`
