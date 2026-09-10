#!/usr/bin/env node
/**
 * Dev-only seed data so the home ranking is meaningful locally.
 * Runs against the Firestore emulator (start it first: `yarn firebase emulators:start`).
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
 *   GCLOUD_PROJECT=readme-demo \
 *   node scripts/seed.mjs
 *
 * Requires firebase-admin:  yarn add -D firebase-admin
 * Never run this against a production project.
 */
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Refusing to run: set FIRESTORE_EMULATOR_HOST to target the emulator.')
  process.exit(1)
}

const { initializeApp } = await import('firebase-admin/app')
const { getFirestore, FieldValue } = await import('firebase-admin/firestore')

initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'readme-demo' })
const db = getFirestore()

const AUTHORS = [
  { nameEn: 'Martin Wickramasinghe', nameSi: 'මාර්ටින් වික්‍රමසිංහ', genres: ['novel', 'essays'] },
  { nameEn: 'Ediriweera Sarachchandra', nameSi: 'එදිරිවීර සරච්චන්ද්‍ර', genres: ['drama', 'novel'] },
  { nameEn: 'Gunadasa Amarasekara', nameSi: 'ගුණදාස අමරසේකර', genres: ['poetry', 'novel'] },
  { nameEn: 'Sybil Wettasinghe', nameSi: 'සිබිල් වෙත්තසිංහ', genres: ['children'] },
]

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const bayes = (avg, v, m = 5, c = 3.5) =>
  v <= 0 ? 0 : Math.round(((v / (v + m)) * avg + (m / (v + m)) * c) * 10) / 10

async function run() {
  for (const a of AUTHORS) {
    const ratingCount = rnd(6, 30)
    const ratingAvg = rnd(35, 49) / 10
    const authorRef = db.collection('authors').doc()
    await authorRef.set({
      ownerUid: 'seed-owner',
      nameEn: a.nameEn,
      nameSi: a.nameSi,
      bioEn: `${a.nameEn} is a celebrated Sri Lankan writer.`,
      bioSi: `${a.nameSi} යනු ප්‍රසිද්ධ ශ්‍රී ලාංකික ලේඛකයෙකි.`,
      photoURL: null,
      coverURL: null,
      birthYear: rnd(1890, 1940),
      location: 'Sri Lanka',
      genres: a.genres,
      website: null,
      socialLinks: [],
      status: 'approved',
      verified: true,
      featured: false,
      bookCount: 2,
      ratingSum: Math.round(ratingAvg * ratingCount),
      ratingCount,
      ratingAvg,
      bayesianScore: bayes(ratingAvg, ratingCount),
      reviewCount: ratingCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    for (let i = 1; i <= 2; i++) {
      const bc = rnd(4, 40)
      const bavg = rnd(33, 50) / 10
      await db.collection('books').add({
        authorId: authorRef.id,
        authorNameEn: a.nameEn,
        authorNameSi: a.nameSi,
        ownerUid: 'seed-owner',
        titleEn: `${a.nameEn.split(' ')[0]} — Work ${i}`,
        titleSi: `${a.nameSi.split(' ')[0]} — කෘතිය ${i}`,
        descriptionEn: 'A landmark of modern Sinhala literature.',
        descriptionSi: 'නූතන සිංහල සාහිත්‍යයේ සන්ධිස්ථානයකි.',
        coverURL: null,
        isbn: null,
        language: i % 2 ? 'si' : 'bilingual',
        genres: a.genres,
        publishedYear: rnd(1940, 1995),
        publisher: 'Sarasavi',
        pageCount: rnd(120, 400),
        status: 'approved',
        featured: i === 1,
        ratingSum: Math.round(bavg * bc),
        ratingCount: bc,
        ratingAvg: bavg,
        bayesianScore: bayes(bavg, bc),
        reviewCount: bc,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  }
  console.log('Seeded authors + books into the emulator.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
