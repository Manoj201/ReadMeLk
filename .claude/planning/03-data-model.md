# 03 — Data model

Firestore (native mode, region `asia-south1`). Document shapes are given as TypeScript
interfaces that `src/types/index.ts` must mirror. Timestamps are Firestore `Timestamp`.

## Collections

### `users/{uid}`

Created on first sign-in by `AuthListener`.

```ts
interface AppUser {
  uid: string;
  displayName: string;
  email: string;            // never rendered publicly
  photoURL: string | null;
  roles: Array<'reader' | 'author' | 'admin'>;  // 'reader' on create
  authorProfileId: string | null;               // set when they become an author
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `authors/{authorId}`

`authorId` is auto-generated. One author profile per user (`ownerUid` unique by
convention; enforced client-side + one-profile check before create).

```ts
interface Author {
  id: string;
  ownerUid: string;
  nameEn: string;
  nameSi: string;
  bioEn: string;
  bioSi: string;
  photoURL: string | null;
  coverURL: string | null;
  birthYear: number | null;
  location: string | null;         // free text, e.g. "Galle"
  genres: string[];                // controlled vocab, see below
  website: string | null;
  socialLinks: { label: string; url: string }[];
  verified: boolean;               // admin-granted badge, default false
  featured: boolean;               // admin-curated, surfaces on home, default false

  // aggregates — mutated ONLY by the review transaction (see below)
  bookCount: number;               // maintained on book create/delete
  ratingSum: number;
  ratingCount: number;
  ratingAvg: number;
  bayesianScore: number;
  reviewCount: number;             // verified (non-guest) author-reviews

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `books/{bookId}`

```ts
interface Book {
  id: string;
  authorId: string;
  authorNameEn: string;            // denormalized for cards/lists
  authorNameSi: string;
  ownerUid: string;                // == the author's ownerUid; used by rules
  titleEn: string;
  titleSi: string;
  descriptionEn: string;
  descriptionSi: string;
  coverURL: string | null;
  isbn: string | null;
  language: 'si' | 'en' | 'bilingual';
  genres: string[];
  publishedYear: number | null;
  publisher: string | null;
  pageCount: number | null;
  featured: boolean;               // admin-curated, surfaces on home, default false

  // aggregates — mutated ONLY by the review transaction
  ratingSum: number;
  ratingCount: number;
  ratingAvg: number;
  bayesianScore: number;
  reviewCount: number;             // verified (non-guest) book-reviews

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `reviews/{reviewId}`

One flat collection for both book and author reviews, discriminated by `targetType`.

- **Registered review id is deterministic:** `reviewId = ${targetId}_${uid}` — this is how
  "one review per user per target" is enforced in the security rules and makes edits a
  plain `set`/`update` on a known id.
- **Guest review id is auto-generated.** Guests may submit more than one; abuse is limited
  client-side (cooldown + honeypot) — see [08-security-and-moderation.md](08-security-and-moderation.md).

```ts
interface Review {
  id: string;
  targetType: 'book' | 'author';
  targetId: string;                // bookId or authorId
  bookId: string | null;           // set when targetType === 'book'
  authorId: string | null;         // set when targetType === 'author'
  rating: 1 | 2 | 3 | 4 | 5;
  titleEn: string | null;
  titleSi: string | null;
  body: string;
  bodyLang: 'si' | 'en';
  isGuest: boolean;
  authorUid: string | null;        // reviewer's uid; null for guests
  reviewerName: string;            // user displayName, or guestName for guests
  guestName: string | null;
  status: 'published' | 'reported' | 'removed';
  helpfulCount: number;            // optional in MVP; default 0
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

> `reviewerName` is denormalized so lists never need a second read. Renaming a user does
> not backfill old reviews (acceptable for v1).

### `reports/{reportId}`

```ts
interface Report {
  id: string;
  reviewId: string;
  targetType: 'book' | 'author';
  targetId: string;
  reason: 'spam' | 'offensive' | 'off-topic' | 'not-a-review' | 'other';
  note: string;
  reporterUid: string | null;      // null if a guest reported
  status: 'open' | 'actioned' | 'dismissed';
  actionedBy: string | null;       // admin uid
  actionedAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### `adminActions/{actionId}`

Append-only audit log. Every mutating admin action (from `/admin/*`) writes one doc via
`logAdminAction()` in the same batch/transaction as the change it records.

```ts
interface AdminAction {
  id: string;
  actorUid: string;                // the admin
  actorName: string;               // denormalized displayName
  action:
    | 'review.remove' | 'review.restore'
    | 'report.dismiss'
    | 'author.verify' | 'author.unverify' | 'author.edit' | 'author.delete'
    | 'book.edit' | 'book.delete'
    | 'author.feature' | 'author.unfeature' | 'book.feature' | 'book.unfeature'
    | 'user.grantAuthor' | 'user.revokeAuthor';
  targetType: 'review' | 'report' | 'author' | 'book' | 'user';
  targetId: string;
  note: string | null;             // e.g. moderation reason
  createdAt: Timestamp;
}
```

Rules: `create` by admins only, with `actorUid == request.auth.uid`; `read` admins only;
**no update, no delete** (immutable). See [07-firebase-setup.md](07-firebase-setup.md).

## Aggregate maintenance (no Cloud Functions)

Every review **create / edit / delete** runs one `runTransaction` in `submitReview()` /
`deleteReview()` (`src/features/reviews/`). Steps:

1. `get` the target doc (`books/{targetId}` or `authors/{targetId}`).
2. `get` the existing review doc (for edit/delete) to know `oldRating`.
3. Compute new aggregates with `applyReviewDelta()` from `lib/rating.ts`:
   - `ratingSum += (newRating - (oldRating ?? 0))` — on delete, `newRating = 0`.
   - `ratingCount += isCreate ? 1 : isDelete ? -1 : 0`.
   - `ratingAvg = ratingCount > 0 ? ratingSum / ratingCount : 0`.
   - `bayesianScore = bayesian(ratingAvg, ratingCount, RATING_M, RATING_C)`.
   - `reviewCount += (verified delta)` — only when `!isGuest`.
4. `set` the review doc and `update` the target doc **in the same transaction**.
5. `updatedAt = serverTimestamp()` on the target.

`bookCount` on `authors` is adjusted by a separate small transaction on book create/delete.

Removing a review from the admin queue reuses the same delete path so aggregates unwind.

### Integrity note

Because clients write aggregates directly, security rules constrain *how much* they can
change per request (`ratingCount` delta ∈ {-1, 0, 1}, `bayesianScore` within range) rather
than preventing it outright. Full protection would need Functions + App Check — tracked as
post-v1 in [09-roadmap.md](09-roadmap.md). See rule sketch in
[07-firebase-setup.md](07-firebase-setup.md).

## Controlled vocabularies

- **Genres** (`src/lib/genres.ts`, each with `en` + `si` labels): Fiction, Novel,
  Short Stories, Poetry, Children, Young Adult, History, Biography & Memoir, Politics,
  Religion & Philosophy, Science, Education / Academic, Translation, Drama, Folklore,
  Essays, Self-Help, Other.
- **Languages:** `si`, `en`, `bilingual`.

## Composite indexes (`firestore.indexes.json`)

| Collection | Fields | Used by |
|---|---|---|
| `books` | `bayesianScore` desc, `ratingCount` desc | Home "Best Reviewed Books" |
| `books` | `featured` ==, `bayesianScore` desc | Home featured strip / `/admin/books` |
| `books` | `genres` array-contains, `bayesianScore` desc | Browse by genre, ranked |
| `books` | `language` ==, `bayesianScore` desc | Browse by language |
| `books` | `authorId` ==, `createdAt` desc | Author profile book grid |
| `books` | `createdAt` desc | "Recently added" |
| `authors` | `bayesianScore` desc, `ratingCount` desc | Home "Top Rated Authors" |
| `reviews` | `targetId` ==, `status` ==, `createdAt` desc | Book/author review list |
| `reviews` | `authorUid` ==, `createdAt` desc | `/me` — my reviews |
| `reviews` | `status` ==, `updatedAt` desc | "Recently Reviewed" on home / `/admin/reviews` |
| `reports` | `status` ==, `createdAt` asc | Admin queue |
| `authors` | `verified` ==, `ratingCount` desc | `/admin/authors` filter |
| `adminActions` | `createdAt` desc | Admin dashboard "recent actions" |
| `adminActions` | `targetType` ==, `targetId` ==, `createdAt` desc | Per-entity admin history |
| `users` | `roles` array-contains, `createdAt` desc | `/admin/users` filter by role |

## Storage layout

| Path | Contents | Write access |
|---|---|---|
| `authorPhotos/{authorId}/profile.<ext>` | author avatar | owner of `authors/{authorId}` |
| `authorPhotos/{authorId}/cover.<ext>` | author cover image | owner |
| `bookCovers/{bookId}/cover.<ext>` | book cover | owner of `books/{bookId}` |

Constraints (enforced in `storage.rules` and `lib/storage.ts`): `image/*` content type,
≤ 5 MB, public read. See [07-firebase-setup.md](07-firebase-setup.md).

## Seed data (dev only)

`scripts/seed.ts` (built in M5): a small set of well-known Sri Lankan authors and books
with a spread of ratings so the home ranking is meaningful locally. Runs against the
Firebase emulator or a dev project; never against production.
