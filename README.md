# ReadMe — Sri Lankan Books Review Platform

Bilingual (සිංහල / English) platform where authors publish profiles and register books,
and readers — registered or guest — rate and review both books and authors. The home page
ranks the best-reviewed books with a Bayesian score. Visual design draws on Sri Lankan
heritage (flag palette, ola-leaf motifs, warm parchment neutrals).

> **Setting this up for real?** Follow [`SETUP.md`](SETUP.md) — every manual step
> (Firebase, database, Storage/App Check, GitHub, Vercel) in order.
>
> Full architecture, data model, i18n strategy, design system and roadmap live in
> [`.claude/planning/`](.claude/planning/README.md).

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
| `yarn typecheck` | `tsc -b` (no emit) |
| `yarn test` | Vitest unit tests |
| `yarn format` / `yarn format:check` | Prettier write / verify |
| `yarn i18n:check` | fail if `en` / `si` locale key sets diverge |
| `yarn seed` | seed dev data into the Firestore emulator |

## Firebase

1. Create a project; enable Email/Password + Google auth, Firestore, Storage.
2. Put the web config into `.env.local` (and the Vercel project env vars).
3. `echo '{ "projects": { "default": "<your-project-id>" } }' > .firebaserc`
4. Deploy rules + indexes: `yarn fb:deploy`
5. Grant the first admin (custom claim, no in-app path):
   ```bash
   yarn add -D firebase-admin
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.mjs <uid>
   ```

Local emulators: `yarn fb:emulators` then `VITE_USE_EMULATORS=true yarn dev`
(seed sample data: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=readme-demo yarn seed`).

### Database (Cloud Firestore)

- **No schema step.** Firestore is document/NoSQL — the collections (`users`, `authors`,
  `books`, `reviews`, `reports`, `adminActions`) are created on first write. The shapes
  live in [`src/types/index.ts`](src/types/index.ts) and
  [`.claude/planning/03-data-model.md`](.claude/planning/03-data-model.md).
- When you create the database, choose **Native mode** and location
  **`asia-south1` (Mumbai)** — location is permanent.
- **You must deploy the composite indexes** ([`firestore.indexes.json`](firestore.indexes.json)).
  Multi-field queries (browse/sort, home ranking) fail with a `FAILED_PRECONDITION` error
  until the indexes finish building — `yarn fb:deploy` handles it, or click the link in the
  error to create each one.
- **You must deploy the security rules** ([`firestore.rules`](firestore.rules),
  [`storage.rules`](storage.rules)) — the default locked rules block all client access, and
  "test mode" rules expire after 30 days.
- Free **Spark** plan is enough (no Cloud Functions). Rating aggregates are kept current by
  a client-side `runTransaction`, not a DB trigger.
- Optional: turn on **Point-in-time recovery** (Firestore → Backups) and set a low-traffic
  budget alert.

### Storage & upload safety (paid plan)

Uploads are validated on **both** sides — important now that billing is enabled:

- **Client** ([`src/lib/storage.ts`](src/lib/storage.ts)): every image is decoded, downscaled
  (avatars ≤512px / ~900 KB, covers ≤1600px / ~2.6 MB) and **re-encoded to WebP** through a
  canvas before upload. Re-encoding guarantees a real raster image and strips any embedded
  script or metadata; the downscale is the main lever on storage + egress cost. Only
  `image/jpeg|png|webp` are accepted; **SVG is rejected** (stored-XSS vector).
- **Storage rules** ([`storage.rules`](storage.rules)): write allowed only to the parent
  doc's owner, only to the filenames `profile.*` / `cover.*`, only `image/jpeg|png|webp`
  under 4 MB. Everything else is denied.
- **Orphan cleanup**: deleting a book or author best-effort deletes its Storage objects
  (no Cloud Function, so it's client-side and non-transactional).
- **Scripted abuse** (someone hitting Storage/Firestore directly, bypassing the app) can't
  be stopped by rules alone. Turn on **App Check**: set `VITE_APPCHECK_SITE_KEY` to a
  reCAPTCHA v3 site key, then enable enforcement per service in the Firebase console. Also
  set a **billing budget alert** while you're there.


## CI / CD (GitHub Actions)

| Workflow | Trigger | Does |
|---|---|---|
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | every push to `main` + every PR | `format:check` → `lint` → `i18n:check` → `typecheck` → `test` → `build`, uploads `dist/` |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | push to `main` (+ manual) | **opt-in.** Deploys the site to Vercel and the Firestore/Storage rules + indexes to Firebase. Each job is a no-op until its secrets are set. |

`.github/dependabot.yml` opens grouped weekly dependency + action-version PRs.

### Repository secrets for `deploy.yml`

Set these in **GitHub → Settings → Secrets and variables → Actions** (skip a group to skip that deploy):

| Secret | For | Where to get it |
|---|---|---|
| `VERCEL_TOKEN` | Vercel deploy | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel deploy | `.vercel/project.json` after `vercel link`, or Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel deploy | same as above |
| `FIREBASE_SERVICE_ACCOUNT` | rules deploy | Firebase console → Project settings → Service accounts → *Generate new private key* (paste the whole JSON) |
| `FIREBASE_PROJECT_ID` | rules deploy | your Firebase project id |

> The `VITE_FIREBASE_*` build vars live in the **Vercel project** (Settings → Environment
> Variables), not in GitHub — `vercel build` pulls them during the deploy.

Prefer Vercel's own Git integration (auto preview per PR, production on `main`)? Import the
repo at [vercel.com/new](https://vercel.com/new), set the env vars there, and delete the
`vercel` job from `deploy.yml` — `ci.yml` still guards every PR.

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
