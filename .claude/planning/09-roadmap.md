# 09 — Roadmap

Milestones are ordered so each depends only on earlier ones. Every **[MVP]** story in
[04-features-user-stories.md](04-features-user-stories.md) lands in M0–M6.

---

## M0 — Scaffold
**Goal:** an empty but deployed, correctly-configured shell.

- `yarn create vite` (React + TS); set up `@/*` path alias in `vite.config.ts` +
  `tsconfig.json`.
- Add Tailwind + `shadcn` init; ESLint (typescript-eslint, react-hooks, jsx-a11y,
  i18next) + Prettier; Vitest + Testing Library + `src/test/setup.ts`.
- Install runtime deps: `firebase`, `zustand`, `@tanstack/react-query`,
  `react-router-dom`, `react-i18next i18next i18next-browser-languagedetector`.
- Router skeleton with all routes from [02-architecture.md](02-architecture.md) rendering
  placeholders; `providers.tsx`.
- i18n bootstrap: namespaces wired, `common` + `home` keys present in `en` and `si`,
  `LanguageToggle` working, `<html lang>` + body font class switching.
- Commit `yarn.lock`. `.gitignore`, `.env.example`, `vercel.json` (SPA rewrite).
- Deploy to Vercel; confirm env-var plumbing with a temporary "config OK" check.

**DoD:** `yarn dev`, `yarn build`, `yarn lint`, `yarn test` all pass; the deployed URL
loads; language toggle persists across reload.

---

## M1 — Design system
**Goal:** the Sri Lankan heritage theme is real and reusable.

- Implement tokens from [06-design-system.md](06-design-system.md): `tailwind.config.ts`
  colors/fonts/radius; `src/index.css` `:root` + `.dark` shadcn vars + custom vars.
- Self-host fonts (Noto Sans/Serif Sinhala, Inter, display serif); `@font-face` + subsets;
  `body.lang-si` line-heights.
- Theme the first-wave shadcn components; build `RatingStars`, `LanguageToggle`,
  `NavBar`, `Footer`, `EmptyState`/`ErrorState`/`LoadingBlock`.
- Motif SVG components: `MotifDivider`, `LotusMark`, footer weave, hero ola-leaf texture.
- `AppShell` (nav + footer) wraps all routes. Light/dark toggle in `uiStore`.

**DoD:** a Storybook-less "kitchen sink" route shows every themed component in both themes
and both languages; automated contrast check (axe) passes.

---

## M2 — Firebase & Auth
**Goal:** users can sign in; identity + roles flow through the app.

- `src/lib/firebase.ts`; optional emulator wiring + `firebase.json`.
- `authStore`, `AuthListener` (create `users/{uid}` on first sign-in, load doc).
- `SignInForm` / `SignUpForm` (email + Google); `/signin`, `/signup`, sign-out.
- `RequireAuth`, `RequireRole`; `?next=` redirect handling.
- Deploy `firestore.rules`, `storage.rules`, `firestore.indexes.json`
  ([07-firebase-setup.md](07-firebase-setup.md)).
- `scripts/set-admin.ts` + written ops note for granting the first admin.

**DoD:** sign up (both methods), reload keeps session, sign out clears it; a non-admin
hitting `/admin` gets 404; rules unit-tested with the emulator for the users/authors/books
happy paths.

---

## M3 — Authors & Books
**Goal:** authors have a presence and a catalogue.

- "Become an author" flow (`roles += 'author'`, redirect).
- `AuthorForm` create/edit (bilingual fields, photo + cover upload to
  `authorPhotos/{authorId}/…`, one-profile-per-user guard).
- `AuthorProfilePage`: bio/name in active language + language switch, cover, genres, book
  grid, rating summary placeholder, author-reviews list placeholder.
- `BookForm` create/edit/delete (bilingual, cover upload, genres, metadata);
  `authors.bookCount` transaction.
- `BookDetailPage`; `BookBrowsePage` with genre/language/min-rating filters + infinite
  scroll (composite indexes); client title search.
- `useLocalizedField` helper; genre vocab in `lib/genres.ts`.

**DoD:** an author can sign up → create profile → publish a book → see it on their profile
and in `/books`, all in both languages, with working image uploads.

---

## M4 — Reviews & ratings
**Goal:** the core loop — rate and review books and authors.

- `RatingStars` input mode; `ReviewForm` with verified + guest branches (honeypot,
  guest-name warning, localStorage cooldown).
- `submitReview()` / `deleteReview()` with the aggregate `runTransaction`
  ([03-data-model.md](03-data-model.md)); `lib/rating.ts` (`bayesian`,
  `applyReviewDelta`, `RATING_M`, `RATING_C`) with unit tests.
- `ReviewList` / `ReviewItem` with "Verified reader" vs "Guest" labels, language chip,
  newest-first; rating summary + 5→1 distribution on book and author pages.
- Edit/delete own review; one-review-per-target via deterministic id.
- Report-a-review dialog → `reports` doc.

**DoD:** verified and guest reviews both post and immediately move the target's average and
Bayesian score; editing a rating adjusts the average correctly; deleting unwinds it;
rating math tests green.

---

## M5 — Home ranking & discovery polish
**Goal:** the home page surfaces the best of the platform.

- `HomePage`: hero (motif + language toggle), **Best Reviewed Books** (`books` by
  `bayesianScore`, exclude `ratingCount === 0`), **Top Rated Authors**, **Recently
  Reviewed** (latest published reviews joined to targets), genre shortcut chips.
- `scripts/seed.ts`: a curated set of Sri Lankan authors/books + spread of ratings, run
  against the emulator/dev project.
- Empty/loading/error states across home and browse.

**DoD:** with seed data, the home lists render and visibly re-order when a new review is
added; genre chips deep-link into filtered browse.

---

## M6 — Admin, moderation & release polish
**Goal:** admins can run the platform; the app is launch-ready.

- **Admin area** (`/admin` + subpages) — see the Admin epic in
  [04-features-user-stories.md](04-features-user-stories.md) and
  [08-security-and-moderation.md](08-security-and-moderation.md):
  - `/admin` dashboard: counts (users, authors, books, reviews, open reports) via
    `getCountFromServer`; links to sub-tools; recent admin actions.
  - `/admin/reports`: open-reports queue; Remove review / Dismiss (audit-logged).
  - `/admin/reviews`: search/list any review, remove/restore.
  - `/admin/authors`: list/search; toggle `verified` badge; edit/delete any profile;
    toggle `featured`.
  - `/admin/books`: list/search; edit/delete any book; toggle `featured`.
  - `/admin/users`: list/search; grant/revoke the **`author`** role (Firestore write);
    show who is `admin` (read-only — `admin` is granted only via `scripts/set-admin.ts`).
  - Every mutating admin action writes an `adminActions` audit doc
    ([03-data-model.md](03-data-model.md)).
- Release polish: all empty/loading/error states; a11y pass (contrast, focus rings,
  reduced motion, alt text, `aria-hidden` motifs); `yarn i18n:check` +
  manual Sinhala walkthrough; SEO/meta tags + Open Graph; 404 page; favicon/`LotusMark`.
- Final rules + indexes deploy; production Firebase project + Vercel production domain.

**DoD:** an admin can work a report end-to-end (aggregates unwind), verify an author,
grant the author role to a user, and every action appears in the audit log; i18n check
passes; Lighthouse a11y ≥ 95 in both themes.

---

## Post-v1 (not scheduled)

- **Cloud Functions + App Check** hardening: move the aggregate transaction server-side,
  deny client writes to aggregate fields, add rate limiting and captcha verification for
  guest reviews. No data-model change required — see
  [08-security-and-moderation.md](08-security-and-moderation.md).
- Full-text search (Algolia) for books and authors.
- Tamil (`ta`) locale.
- "Helpful" votes + sort; author self-review guard as a rule.
- Author claim / identity verification workflow.
- Reading lists / shelves; editorial collections.
- Password reset, profile editing for readers.

---

## Manual E2E checklist (run before each release)

- [ ] Sign up with email; sign up with Google; both create a `users` doc.
- [ ] Session survives a hard reload; sign-out clears it and the user-scoped cache.
- [ ] Become an author → create bilingual profile with photo + cover → profile page renders
      in both languages with the language switch and fallback chips.
- [ ] Register a book with a cover → appears on the author profile and in `/books`.
- [ ] Edit and delete own book; `authors.bookCount` changes accordingly.
- [ ] Post a verified review on a book → average + Bayesian score move; `reviewCount` +1.
- [ ] Edit that review's rating → average adjusts; delete it → fully unwinds.
- [ ] Post a guest review with a name → counts toward the average, labelled "Guest",
      cooldown blocks an immediate second guest review on the same target.
- [ ] Post a review on an author → author aggregates update.
- [ ] Report a review → appears in `/admin/reports`.
- [ ] As admin: Remove the reported review → it vanishes from public lists, aggregates
      unwind, an `adminActions` doc is written; Dismiss another report.
- [ ] As admin: verify an author (badge shows), grant the `author` role to a plain user,
      toggle `featured` on a book.
- [ ] Non-admin visiting `/admin`, `/admin/users` gets 404.
- [ ] Home: Best Reviewed Books / Top Rated Authors / Recently Reviewed populate and
      re-order after a new review; genre chips deep-link.
- [ ] Full language walkthrough in Sinhala — no English leakage, no clipped text.
- [ ] Light and dark themes both pass contrast; keyboard-only navigation works throughout.
