#!/usr/bin/env node
/**
 * One-time backfill for the moderation gate. Run this ONCE, after deploying the
 * new composite indexes but BEFORE deploying the new security rules — the new
 * `status == 'approved'` reads return nothing for docs that predate the field.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   node scripts/backfill-moderation.mjs [--dry-run]
 *
 * Requires `firebase-admin` (a dev dependency):  yarn add -D firebase-admin
 * The service-account key must NOT be committed.
 *
 * Idempotent — existing valid statuses are left untouched:
 *   books   without a valid ModerationStatus  -> status: 'approved'
 *   authors without a valid ModerationStatus  -> status: 'approved'
 *   reviews with status missing or 'reported' -> status: 'published'
 */
const dryRun = process.argv.includes('--dry-run')

const { initializeApp, applicationDefault } = await import('firebase-admin/app')
const { getFirestore } = await import('firebase-admin/firestore')

initializeApp({ credential: applicationDefault() })
const db = getFirestore()

const MOD = new Set(['pending', 'approved', 'rejected'])
const REVIEW = new Set(['pending', 'published', 'removed'])

async function backfill(collection, valid, fallback, fix) {
  const snap = await db.collection(collection).get()
  let touched = 0
  for (const doc of snap.docs) {
    const current = doc.data().status
    const next = fix ? fix(current) : valid.has(current) ? null : fallback
    if (next == null || next === current) continue
    touched++
    if (dryRun) {
      console.log(`  [dry] ${collection}/${doc.id}: ${current ?? '(none)'} -> ${next}`)
    } else {
      await doc.ref.update({ status: next })
    }
  }
  console.log(`${collection}: ${touched} doc(s) ${dryRun ? 'would be' : ''} updated (of ${snap.size})`)
}

await backfill('books', MOD, 'approved')
await backfill('authors', MOD, 'approved')
await backfill('reviews', REVIEW, 'published', (s) =>
  s === 'reported' || !REVIEW.has(s) ? 'published' : null,
)

console.log(dryRun ? '\nDry run complete — no writes made.' : '\nBackfill complete.')
