# ReadMe — Sri Lankan Books Review Platform

ReadMe is a bilingual (සිංහල / English) book review platform for Sri Lanka. Authors publish
a full author profile and register their books; readers — registered or guest — leave star
ratings and written reviews for both books and authors. The home page surfaces the
best-reviewed books using a Bayesian ranking. The visual design is rooted in Sri Lankan
heritage (flag palette, ola-leaf manuscript motifs, warm parchment neutrals).

## Status

Planning complete. Implementation not started. **Read `.claude/planning/README.md` first.**

## Tech stack

- React + TypeScript + **Vite**
- **Yarn** package manager (commit `yarn.lock`; never `package-lock.json`)
- Zustand for UI/client state; TanStack Query for Firestore data
- shadcn/ui + Tailwind CSS
- Firebase: Firestore + Auth + Storage only (**no Cloud Functions**, free Spark plan)
- react-i18next for Sinhala/English
- Deployed on Vercel (Firebase is backend-only, no Firebase Hosting)

## Commands

| Command | Purpose |
|---|---|
| `yarn` | install dependencies |
| `yarn dev` | Vite dev server |
| `yarn build` | production build to `dist/` |
| `yarn preview` | preview the production build |
| `yarn lint` | ESLint |
| `yarn test` | Vitest |
| `yarn format` | Prettier |

## Conventions

- TypeScript `strict`. Path alias `@/*` → `src/*`.
- shadcn primitives live in `src/components/ui/`; shared composites in `src/components/`.
- Feature-first folders under `src/features/*` (auth, authors, books, reviews, home, admin).
- Admin area lives at `/admin*` behind `RequireRole role="admin"`; `admin` is a Firebase
  custom claim set only by `scripts/set-admin.ts` (never via the UI). Every mutating admin
  action writes an immutable `adminActions` audit doc.
- Zustand stores in `src/stores/` (`uiStore`, `authStore`).
- i18n keys in `src/locales/{en,si}/*.json`, namespaced. No hardcoded UI strings.
- Shared types in `src/types/` mirror the Firestore schemas in `.claude/planning/03-data-model.md`.

## Firebase notes

- Config comes from `VITE_FIREBASE_*` env vars. Never commit `.env.local`.
- There are no Cloud Functions: rating aggregates (`ratingSum`, `ratingCount`, `ratingAvg`,
  `bayesianScore`, `reviewCount`) are maintained client-side inside a Firestore
  `runTransaction` on every review create / update / delete.
- Admin role is a manually-set custom claim (`request.auth.token.admin == true`).

## Planning docs

`.claude/planning/` — `README.md` (index) then `01-overview` … `09-roadmap`.
