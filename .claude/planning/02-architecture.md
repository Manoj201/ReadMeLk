# 02 — Architecture

## Tooling

- **Build:** Vite (React + TypeScript template).
- **Package manager:** Yarn. `yarn.lock` is committed; `package-lock.json` must never be.
- **Node:** 20 LTS or newer.
- **Testing:** Vitest + @testing-library/react + @testing-library/jest-dom.
- **Lint/format:** ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier.

## Rendering & routing

- Single-page app. No SSR. Firebase is a backend SaaS; there is no Firebase Hosting.
- Routing: `react-router-dom` v6 data routers.
- Vercel serves `dist/` with an SPA rewrite (`vercel.json`, see [07-firebase-setup.md](07-firebase-setup.md) / roadmap M6).

### Route map

| Path | View | Guard |
|---|---|---|
| `/` | Home: best-reviewed books, top authors, recently reviewed | — |
| `/books` | Browse / filter books | — |
| `/books/:bookId` | Book detail + reviews | — |
| `/books/new` | Create book | `RequireAuth` + author role |
| `/books/:bookId/edit` | Edit book | owner or admin |
| `/authors` | Browse authors | — |
| `/authors/:authorId` | Full author profile + author reviews | — |
| `/register/author` | Become an author / create author profile | `RequireAuth` |
| `/signin`, `/signup` | Auth | redirect away if already signed in |
| `/me` | Current user: their reviews, their author profile link | `RequireAuth` |
| `/admin` | Admin dashboard: platform counts, links, recent admin actions | `RequireRole role="admin"` |
| `/admin/reports` | Open-reports moderation queue | `RequireRole role="admin"` |
| `/admin/reviews` | Search any review; remove / restore | `RequireRole role="admin"` |
| `/admin/authors` | Manage authors: verify badge, edit/delete, feature | `RequireRole role="admin"` |
| `/admin/books` | Manage books: edit/delete any, feature | `RequireRole role="admin"` |
| `/admin/users` | Manage users: grant/revoke `author` role (view admins read-only) | `RequireRole role="admin"` |
| `*` | NotFound | — |

Guards: `<RequireAuth>` (redirects to `/signin?next=…`) and `<RequireRole role="admin">`
(404s for non-admins). Author-only actions check `roles.includes('author')`.

## Folder structure

```
src/
  app/
    router.tsx           # route tree + guards
    providers.tsx        # QueryClientProvider, I18nextProvider, ThemeProvider, <AuthListener/>
    AuthListener.tsx     # single onAuthStateChanged subscription -> authStore + user doc
  components/
    ui/                  # shadcn primitives (generated)
    RatingStars.tsx      # display + input star widget
    LanguageToggle.tsx
    EmptyState.tsx  ErrorState.tsx  LoadingBlock.tsx
    MotifDivider.tsx     # decorative liyavel SVG
    AppShell.tsx  NavBar.tsx  Footer.tsx
  features/
    auth/                # SignInForm, SignUpForm, useAuth, guards, googleSignIn()
    authors/             # AuthorProfilePage, AuthorForm, AuthorCard, useAuthor(s), authorReviews
    books/               # BookDetailPage, BookForm, BookCard, BookBrowsePage, useBook(s)
    reviews/             # ReviewForm (guest + user), ReviewList, ReviewItem, useReviews, submitReview()
    home/                # HomePage, BestReviewedSection, TopAuthorsSection, RecentlyReviewedSection
    admin/               # AdminLayout + guard, DashboardPage, ReportQueuePage, ReviewsAdminPage,
                         # AuthorsAdminPage, BooksAdminPage, UsersAdminPage,
                         # useReports, useAdminStats, actionReport(), logAdminAction(),
                         # setAuthorRole(), toggleVerified(), toggleFeatured()
  lib/
    firebase.ts          # initializeApp; exports auth, db, storage
    firestore.ts         # typed converters, collection refs, query helpers, pagination
    rating.ts            # bayesianScore(), applyReviewDelta(), RATING_M, RATING_C
    storage.ts           # uploadImage(path, file) with size/type guard
    format.ts            # date/number formatting bound to the active locale
  stores/
    uiStore.ts           # language, theme, mobileNavOpen, toast queue, review-draft persistence
    authStore.ts         # { user: AppUser | null, status } mirror of the auth session
  locales/
    en/{common,auth,book,author,review,home,admin}.json
    si/{common,auth,book,author,review,home,admin}.json
  types/
    index.ts             # AppUser, Author, Book, Review, Report, AdminAction — mirror 03-data-model.md
  test/
    setup.ts
scripts/
  seed.ts                # dev seed data (roadmap M5)
```

## State strategy

Two clearly separated layers:

### Zustand — UI / client state (`src/stores`)

- `uiStore`: active `language` (`'si' | 'en'`), `theme` (`'light' | 'dark' | 'system'`),
  `mobileNavOpen`, transient `toasts`, and a persisted **review draft** (title/body/rating
  keyed by target) via `zustand/middleware` `persist` → `localStorage`. Language and theme
  are also persisted.
- `authStore`: a synchronous mirror of the Firebase session — `{ user: AppUser | null,
  status: 'loading' | 'authed' | 'anon' }`. Written only by `AuthListener`. Components read
  it for instant role checks without awaiting Firestore.

### TanStack Query — server state

All Firestore reads and writes go through `@tanstack/react-query`:

- Query keys: `['books', filters]`, `['book', id]`, `['authors', filters]`, `['author', id]`,
  `['reviews', targetType, targetId]`, `['home', 'bestReviewed']`, `['reports', 'open']`,
  `['me', 'reviews', uid]`, `['admin', 'stats']`, `['admin', 'users', q]`,
  `['admin', 'actions']`.
- Lists use `useInfiniteQuery` with Firestore cursor pagination (`startAfter`).
- Mutations (`submitReview`, `actionReport`, book/author CRUD) do optimistic updates and
  invalidate the affected keys, including the target's aggregate-bearing query.
- Rationale: Zustand alone is awkward for cached, paginated async lists with
  loading/error/refetch. Zustand stays for genuinely client-only state.

### Auth flow

`AuthListener` mounts once under the providers, subscribes with `onAuthStateChanged`, and on
sign-in:

1. Ensures `users/{uid}` exists (create with `roles: ['reader']` on first sign-in).
2. Loads the user doc and writes `authStore.user`.
3. On sign-out, clears `authStore.user` and any user-scoped query cache.

Persistence: `browserLocalPersistence` so sessions survive reloads.

## Rating math (`lib/rating.ts`)

- `ratingAvg = ratingSum / ratingCount` (guard `ratingCount === 0`).
- Home ranking uses a **Bayesian average** so a single 5★ book cannot outrank a
  consistently-loved one:

  ```
  bayesianScore = (v / (v + m)) * R + (m / (v + m)) * C
  ```

  - `R` = this item's `ratingAvg`
  - `v` = this item's `ratingCount`
  - `m` = `RATING_M` = **5** (minimum votes before the item's own average dominates)
  - `C` = `RATING_C` = **3.5** (prior mean; the seeded site-wide average)

  `RATING_M` and `RATING_C` are exported constants; revisit `C` once real data exists.

- **Guest vs verified:** guest reviews are included in `ratingSum` / `ratingCount` /
  `ratingAvg` (so the rating reflects everyone), but `reviewCount` and the UI track
  verified vs guest separately. This choice is restated in
  [08-security-and-moderation.md](08-security-and-moderation.md); the alternative
  (`guestRatingAvg` kept apart) is noted there.

- `applyReviewDelta(target, { oldRating, newRating, isCreate, isDelete })` returns the new
  aggregate fields and is the single place aggregates change. Used inside the Firestore
  transaction in [03-data-model.md](03-data-model.md).

## Testing

- Unit: `rating.ts` (Bayesian math, deltas), `format.ts`, store reducers.
- Component: `RatingStars`, `ReviewForm` (guest + user branches), `LanguageToggle`,
  guards.
- No automated E2E in v1 — a manual checklist lives in [09-roadmap.md](09-roadmap.md).

## Build & deploy

- Vercel, framework preset **Vite**.
- Install command `yarn install` (auto-detected from `yarn.lock`); build `yarn build`;
  output directory `dist/`.
- Environment variables (`VITE_FIREBASE_*`) set in the Vercel project — see
  [07-firebase-setup.md](07-firebase-setup.md).
- `vercel.json` rewrites all paths to `/index.html` for client routing.
