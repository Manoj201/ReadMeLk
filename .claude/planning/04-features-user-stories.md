# 04 — Features & user stories

Tags: **[MVP]** ship in v1 · **[1.1]** fast follow · **[later]** post-v1.
Each epic notes the collections ([03-data-model.md](03-data-model.md)) and routes
([02-architecture.md](02-architecture.md)) it touches.

---

## Epic 1 — Accounts & Auth
Collections: `users` · Routes: `/signin`, `/signup`, `/me`

- **[MVP]** As a visitor I can sign up with email + password so I can post verified reviews.
  - AC: email/password validation; on success a `users/{uid}` doc is created with
    `roles: ['reader']`; I land on the page I came from (`?next=`).
- **[MVP]** As a visitor I can sign in / sign up with Google.
  - AC: Google popup; first sign-in creates the `users` doc; `displayName`/`photoURL`
    seeded from the Google profile.
- **[MVP]** As a signed-in user I can sign out.
  - AC: session cleared; user-scoped query cache cleared; redirect to `/`.
- **[MVP]** As a signed-in reader I can "become an author", which adds the `author` role
  and starts author-profile creation.
  - AC: `roles` gains `'author'`; redirect to `/register/author`; `authorProfileId` set
    once the profile is created.
- **[MVP]** My session survives a page reload (`browserLocalPersistence`).
- **[1.1]** Password reset email.
- **[1.1]** Edit my display name / avatar.

---

## Epic 2 — Author profile
Collections: `authors` · Routes: `/register/author`, `/authors`, `/authors/:authorId`

- **[MVP]** As an author I can create my profile with bilingual fields (`nameEn`/`nameSi`,
  `bioEn`/`bioSi`), photo, cover, genres, location, birth year, website, social links.
  - AC: `nameEn` **or** `nameSi` required (at least one), plus a bio in the same language;
    the other language may be filled later; images upload to `authorPhotos/{authorId}/…`;
    `ownerUid` set to me; one profile per user (blocked if `authorProfileId` already set).
- **[MVP]** As an author I can edit my profile later.
- **[MVP]** As anyone I can view a full author profile page showing: name + bio in the
  active language (with a "සිංහල / English" switch when both exist), photo, cover, genres,
  a grid of the author's books, the author rating summary (avg + count + distribution),
  and the list of author-reviews.
  - AC: books ordered by `createdAt` desc; missing-language content falls back with a label;
    empty states for "no books yet" / "no reviews yet".
- **[MVP]** As anyone I can report the author profile is missing / wrong via the generic
  report entry (routes to admin note; no profile takedown flow in v1).
- **[MVP]** As an admin I can toggle `verified` on an author (verified badge).
- **[1.1]** Browse/search the `/authors` index by name and genre.
- **[later]** Author "claim" / identity verification workflow.

---

## Epic 3 — Book registration
Collections: `books`, `authors.bookCount` · Routes: `/books/new`, `/books/:bookId/edit`

- **[MVP]** As an author I can register a book: bilingual title + description, cover upload,
  genres, `language` (`si`/`en`/`bilingual`), published year, publisher, page count, ISBN.
  - AC: must have an author profile; `authorId`, `ownerUid`, `authorNameEn`/`authorNameSi`
    denormalized from my profile; `titleEn` **or** `titleSi` required; cover uploads to
    `bookCovers/{bookId}/cover.<ext>`; `authors.bookCount` incremented in a transaction.
- **[MVP]** As an author I can edit or delete my own book.
  - AC: only `ownerUid === me` (or admin); delete decrements `authors.bookCount`; deleting
    a book leaves its reviews orphaned-hidden (filtered out client-side) — acceptable v1.
- **[1.1]** Multiple editions / cover history.

---

## Epic 4 — Book discovery
Collections: `books` · Routes: `/books`, `/books/:bookId`

- **[MVP]** As anyone I can browse books and filter by genre, language, and minimum
  rating, sorted by Bayesian score or most recent.
  - AC: server-side filter+sort using the composite indexes; infinite scroll pagination.
- **[MVP]** As anyone I can search books by title (client-side filter over the loaded page
  for MVP).
  - AC: matches `titleEn` or `titleSi`, case/diacritic-insensitive where feasible.
- **[MVP]** As anyone I can open a book detail page: cover, bilingual title/description,
  author link, metadata, rating summary + distribution, and the review list with a
  "Write a review" action.
- **[later]** Full-text search via Algolia.

---

## Epic 5 — Reviews & ratings
Collections: `reviews`, aggregates on `books`/`authors` · Routes: book & author pages

- **[MVP]** As a signed-in user I can add a rating (1–5) + written review to a book or an
  author, choosing the review language.
  - AC: deterministic id `${targetId}_${uid}` → one review per target; `isGuest:false`,
    `authorUid` set; the aggregate transaction updates `ratingSum/Count/Avg`,
    `bayesianScore`, and `reviewCount` on the target.
- **[MVP]** As a signed-in user I can edit or delete my own review.
  - AC: edit updates the rating delta in the aggregate transaction; delete unwinds it.
- **[MVP]** As a guest I can add a rating + review with just a name, no account.
  - AC: `isGuest:true`, `guestName` required, `authorUid:null`, auto id; client cooldown
    (e.g. one guest review per target per browser per 10 min) + hidden honeypot field;
    counts toward `ratingSum/Count/Avg` but not `reviewCount`.
- **[MVP]** As anyone I see reviews labelled "Verified reader" vs "Guest", newest first,
  with the rating summary showing average, total ratings, and a 5→1 distribution bar.
  - AC: a review's body shows its `bodyLang`; a language chip is shown if it differs from
    the active UI language.
- **[MVP]** As anyone I can report a review (opens the report dialog → `reports` doc).
- **[1.1]** Mark a review "helpful" (`helpfulCount`), sort by helpful.
- **[1.1]** Prevent an author from reviewing their own book/profile (client guard + rule).

---

## Epic 6 — Home page
Collections: `books`, `authors`, `reviews` · Route: `/`

- **[MVP]** As anyone I see a hero with a Sri Lankan heritage motif and a prominent
  language toggle.
- **[MVP]** "Best Reviewed Books": top N `books` by `bayesianScore` (tie-break
  `ratingCount`), shown as cards with cover, title, author, avg stars, rating count.
  - AC: books with `ratingCount === 0` are excluded.
- **[MVP]** "Top Rated Authors": top N `authors` by `bayesianScore`.
- **[MVP]** "Recently Reviewed": latest `reviews` (`status == 'published'`) joined to their
  target for display.
- **[MVP]** Genre shortcut chips linking into `/books?genre=…`.
- **[1.1]** "New this month", editorial picks.

---

## Epic 7 — Moderation
Collections: `reports`, `reviews`, `adminActions` · Route: `/admin/reports`

- **[MVP]** As anyone (incl. guests) I can file a report on a review with a reason + note.
- **[MVP]** As an admin I see an open-reports queue (oldest first) with the offending
  review rendered inline and its target linked.
- **[MVP]** As an admin I can **Remove** a review (sets `status:'removed'`, unwinds
  aggregates via the review-delete transaction, sets `actionedBy`/`actionedAt`, writes an
  `adminActions` doc) or **Dismiss** a report (`status:'dismissed'`, logged).
- **[MVP]** Removed reviews disappear from public lists but the doc is retained; an admin
  can **Restore** a removed review from `/admin/reviews` (re-applies aggregates, logged).
- **[1.1]** Auto-flip a review to `status:'reported'` after N distinct reports.
- **[1.1]** Admin can also edit/redact instead of full removal.

---

## Epic 8 — Internationalization
See [05-i18n.md](05-i18n.md).

- **[MVP]** Global Sinhala / English toggle in the nav; choice persisted
  (`uiStore` + `localStorage`) and applied on load; `<html lang>` updated.
- **[MVP]** All UI chrome is translated via namespaced keys; no hardcoded strings.
- **[MVP]** User-generated content is shown in its stored language with a label; bilingual
  fields switch with the toggle and fall back to the other language when one side is empty.
- **[MVP]** Dates and numbers formatted with `si-LK` / `en-LK`.
- **[later]** Tamil (`ta`).

---

## Epic 9 — Admin dashboard & platform management
Collections: `users`, `authors`, `books`, `reviews`, `reports`, `adminActions`
Routes: `/admin`, `/admin/reports`, `/admin/reviews`, `/admin/authors`, `/admin/books`,
`/admin/users` · All under `RequireRole role="admin"` (404 for everyone else)

Role model recap: `admin` is granted **only** out-of-band via `scripts/set-admin.ts`
(custom claim) — there is no UI to create an admin. Everything below is what a signed-in
admin can then do from the app, enforced again by security rules
([07-firebase-setup.md](07-firebase-setup.md)).

- **[MVP]** As an admin I land on `/admin` and see platform counts — users, authors,
  books, reviews, open reports — via `getCountFromServer`, plus a "recent admin actions"
  feed (`adminActions` by `createdAt` desc) and links to each sub-tool.
- **[MVP]** As an admin I can open `/admin/reviews`, search/filter reviews (by target,
  status, guest vs verified), and **Remove** or **Restore** any review; both re-run the
  aggregate transaction and write an `adminActions` doc.
- **[MVP]** As an admin I can open `/admin/authors`, search authors, and:
  - toggle the **`verified`** badge (`author.verify` / `author.unverify`, logged);
  - **edit** any author profile (bilingual fields) or **delete** it (logged; the author's
    books are left in place but flagged in the UI as "author removed");
  - toggle **`featured`** (`author.feature` / `author.unfeature`, logged).
- **[MVP]** As an admin I can open `/admin/books`, search books, and **edit** or **delete**
  any book (delete decrements `authors.bookCount`; logged), and toggle **`featured`**.
- **[MVP]** As an admin I can open `/admin/users`, search users, and **grant** or
  **revoke** the **`author`** role (a plain `users` doc write; logged). The list shows
  which users are `admin` as **read-only** (with a note that admin is set via the CLI
  script).
- **[MVP]** Every mutating admin action writes an immutable `adminActions` audit doc with
  `actorUid`, `action`, `targetType`, `targetId`, optional `note`, `createdAt`. The
  dashboard and each entity's admin view can show its history.
- **[MVP]** Guard behaviour: a non-admin (guest or signed-in reader/author) hitting any
  `/admin*` route gets the NotFound page; direct Firestore writes to admin-only paths are
  denied by rules.
- **[1.1]** Bulk actions (multi-select remove/dismiss), CSV export of reviews/reports,
  date-range filters on the dashboard, "featured" ordering control.
- **[1.1]** Soft "shadow-hide" an author/book (hidden from public, not deleted).
- **[later]** In-app admin invitation flow (still backed by a Function that sets the claim).

---

## Cross-cutting acceptance criteria (all epics)

- Every list/section has explicit loading, empty, and error states.
- All interactive elements are keyboard reachable with a visible focus ring on the warm
  palette; images have alt text; motif SVGs are `aria-hidden`.
- Both light and dark themes pass WCAG AA contrast (see [06-design-system.md](06-design-system.md)).
- Forms show inline validation and disable submit while pending.
