# ReadMe — Sri Lankan Books Review Platform

Bilingual (සිංහල / English) platform where authors publish profiles and register books,
and readers — registered or guest — rate and review both books and authors. The home page
ranks the best-reviewed books with a Bayesian score. Visual design draws on Sri Lankan
heritage (flag palette, ola-leaf motifs, warm parchment neutrals).

> Full architecture, data model, i18n strategy, design system and roadmap live in
> [`.claude/planning/`](.claude/planning/README.md). Start there.

## Stack

React 19 + TypeScript + Vite · Yarn · Zustand (UI state) + TanStack Query (server state) ·
Tailwind + shadcn-style components · Firebase (Firestore + Auth + Storage, **no Cloud
Functions**) · react-i18next · deploy on Vercel.

## Getting started

```bash
yarn install --ignore-engines      # Node 20.9 predates some packages' engines fields
cp .env.example .env.local          # fill from Firebase console → Project settings
yarn dev
```

| Command | What it does |
|---|---|
| `yarn dev` | Vite dev server |
| `yarn build` | type-check + production build to `dist/` |
| `yarn preview` | serve the production build |
| `yarn lint` | ESLint (typescript-eslint, react-hooks, jsx-a11y) |
| `yarn test` | Vitest unit tests |
| `yarn format` | Prettier |
| `yarn i18n:check` | fail if `en` / `si` locale key sets diverge |
| `yarn seed` | seed dev data into the Firestore emulator |

## Firebase

1. Create a project; enable Email/Password + Google auth, Firestore (`asia-south1`), Storage.
2. Put the web config into `.env.local` (and Vercel env vars).
3. Deploy rules + indexes:
   ```bash
   yarn firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
4. Grant the first admin (custom claim, no in-app path):
   ```bash
   yarn add -D firebase-admin
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.mjs <uid>
   ```

Local emulators: `yarn firebase emulators:start` then `VITE_USE_EMULATORS=true yarn dev`.

## Project layout

```
src/
  app/         router, providers, auth listener, DOM chrome sync
  components/  shared UI (RatingStars, AppShell, motifs) + ui/ primitives
  features/    auth · authors · books · reviews · home · admin · me
  lib/         firebase, firestore helpers, rating math, formatting, genres
  locales/     en/ · si/  (namespaced JSON)
  stores/      zustand: uiStore, authStore
  types/       shared types mirroring the Firestore schema
firestore.rules · storage.rules · firestore.indexes.json · firebase.json
scripts/       i18n-check · set-admin · seed
```

## Notes

- No Cloud Functions: rating aggregates are maintained client-side inside a Firestore
  `runTransaction` (`src/features/reviews/api.ts`, `src/lib/rating.ts`). Security rules
  *bound* aggregate deltas rather than fully authenticating them — see
  [`.claude/planning/08-security-and-moderation.md`](.claude/planning/08-security-and-moderation.md).
- Guest reviews: name only, `isGuest: true`, client-side cooldown + honeypot.
- `admin` is a Firebase custom claim; the `/admin` area manages moderation, author
  verification/featuring, content, and the `author` role, with an immutable `adminActions`
  audit log.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
