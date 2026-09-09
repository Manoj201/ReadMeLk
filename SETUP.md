# ReadMe — Setup runbook (manual steps)

Everything you have to do by hand to take this repo from "clones and builds" to
"running in production". Do the sections in order. Est. 45–60 min the first time.

Legend: 🖥️ local terminal · 🌐 a web console · ✅ already done by you

---

## 0. Before you start

- Node **20.9+** and **Yarn 1.x** installed (`node -v`, `yarn -v`).
- A **Google account** (for Firebase) and a **GitHub account**.
- ✅ You've already created a Firebase project on the **Blaze** (pay-as-you-go) plan and
  enabled Storage.

---

## 1. 🖥️ Run it locally (no backend yet)

```bash
yarn install --ignore-engines
yarn dev
```

Open http://localhost:5173 — the UI loads, but sign-in and data do nothing until Firebase
is wired up (next).

---

## 2. 🌐 Register a Web app in Firebase

1. https://console.firebase.google.com → your project.
2. Project Overview → click the **`</>`** (Web) icon → give it a nickname → **Register app**.
3. On the "Add Firebase SDK" screen, copy the six values from the `firebaseConfig` object:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
   (Copy `storageBucket` **exactly** as shown — it may end in `.appspot.com` or
   `.firebasestorage.app`.)

---

## 3. 🌐 Enable Authentication

1. Build → **Authentication** → **Get started**.
2. **Sign-in method** tab:
   - Enable **Email/Password**.
   - Enable **Google** → choose a support email → **Save**.
3. Leave the **Authorized domains** list alone for now (`localhost` is already there). You'll
   add your Vercel domain in step 12.

---

## 4. 🌐 Create the database (Cloud Firestore)

1. Build → **Firestore Database** → **Create database**.
2. **Production mode** (the rules live in this repo).
3. Location: **`asia-south1` (Mumbai)** — this is **permanent**, pick it deliberately.
4. Mode: **Native** (the default). Finish.

There are no tables to create — the collections appear on first write.

---

## 5. 🖥️ Put the config into the app

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste the six values from step 2:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com   # or .firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then set the CLI's default project:

```bash
echo '{ "projects": { "default": "your-project-id" } }' > .firebaserc
```

Restart `yarn dev`. **Sign up** in the app — it should succeed and create your user
document.

---

## 6. 🖥️ Deploy the security rules and indexes

```bash
npx --yes firebase-tools@13 login      # one-time browser login
yarn fb:deploy                         # deploys firestore.rules + indexes + storage.rules
```

Then 🌐 Firestore → **Indexes** tab: wait until every composite index flips from
**Building** to **Enabled** (a few minutes). Until then, the Books/Authors browse pages and
the home ranking will show an error.

> Re-run `yarn fb:deploy` any time you change `firestore.rules`, `storage.rules`, or
> `firestore.indexes.json` — or let CI do it (step 14).

---

## 7. 🖥️ Make yourself an admin

`admin` is a Firebase custom claim; there is deliberately no UI for it.

1. 🌐 Authentication → **Users** → copy **your** User UID (you signed up in step 5).
2. 🌐 Project settings (gear) → **Service accounts** → **Generate new private key** →
   save the file as `service-account.json` in the project root. *(It's git-ignored.)*
3. 🖥️
   ```bash
   yarn add -D firebase-admin
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.mjs <your-uid>
   ```
4. Sign out and back in. `/admin` now works.

---

## 8. 🌐 App Check — optional, recommended on the paid plan

Stops scripts hitting Firestore/Storage directly, which rules can't detect. Safe to skip
for launch and add later — it blocks nothing else.

Use **classic reCAPTCHA v3**, *not* reCAPTCHA Enterprise — it's free and it's what the code
already uses (`ReCaptchaV3Provider` in `src/lib/firebase.ts`). *(Want Enterprise instead?
Create the key in Google Cloud console → Security → reCAPTCHA → Create key, and change the
provider in `src/lib/firebase.ts` to `ReCaptchaEnterpriseProvider`.)*

1. Create the key at **https://www.google.com/recaptcha/admin/create**:
   - Label `ReadMe` · type **Score based (v3)**
   - Domains: `localhost` + your Vercel domain(s)
   - Submit → you get a **Site key** (public) and a **Secret key** (private).
2. 🌐 Firebase → Build → **App Check** → your Web app → open the **reCAPTCHA** row (not
   "reCAPTCHA Enterprise") → paste the **Secret key** → **Save**.
3. Put the **Site key** in `.env.local` (and Vercel env, step 13):
   ```
   VITE_APPCHECK_SITE_KEY=your-recaptcha-v3-SITE-key
   ```
4. Local dev token: also set `VITE_APPCHECK_DEBUG_TOKEN=true`, restart `yarn dev`, open the
   browser console, copy the printed debug token, paste it in App Check → your app →
   **Manage debug tokens**.
5. Once the app still works with App Check active, turn on **Enforcement** for **Cloud
   Firestore** and **Cloud Storage** (App Check → APIs).

---

## 9. 🌐 Billing budget alert

Google Cloud console → **Billing** → **Budgets & alerts** → **Create budget** → set a low
monthly cap (e.g. $10) with 50 / 90 / 100 % email alerts.

---

## 10. 🖥️ Push to GitHub

Create an **empty** repo on github.com (no README/licence), then:

```bash
git remote add origin git@github.com:<you>/ReadMe.git
git push -u origin main
```

The **CI** workflow runs on that push — check the repo's **Actions** tab is green
(format → lint → i18n → typecheck → test → build).

---

## 11. 🌐 Deploy the site — Vercel (pick ONE option)

### Option A — Vercel Git integration (simplest, recommended)

1. https://vercel.com/new → **Import** your GitHub repo.
2. Framework preset: **Vite** (auto-detected). Leave build/output as-is.
3. **Environment Variables** → add for **Production** *and* **Preview**:
   - all six `VITE_FIREBASE_*` values
   - `VITE_APPCHECK_SITE_KEY`
4. **Deploy**.
5. 🖥️ Delete the `vercel:` job from `.github/workflows/deploy.yml` (CI still guards PRs),
   commit, push — so GitHub and Vercel don't both deploy.

### Option B — deploy from GitHub Actions

1. 🖥️ `npx --yes vercel@latest link` (creates `.vercel/project.json`).
2. Read `.vercel/project.json` → note `orgId` and `projectId`.
3. 🌐 Vercel → Account Settings → **Tokens** → create a token.
4. 🌐 GitHub repo → **Settings → Secrets and variables → Actions** → add:
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
5. 🌐 GitHub repo → **Settings → Environments** → **New environment** named `production`.
6. Still set the `VITE_FIREBASE_*` + `VITE_APPCHECK_SITE_KEY` vars in the **Vercel project**
   (Settings → Environment Variables) — `vercel build` reads them during the deploy.

---

## 12. 🌐 Authorize the Vercel domain in Firebase

Authentication → **Settings** → **Authorized domains** → **Add domain** for:

- your production domain (e.g. `readme.vercel.app` or your custom domain)
- your preview pattern if you use PR previews (e.g. `readme-git-*.vercel.app`)

Google sign-in fails in production until you do this.

---

## 13. 🌐 (Option B only) Firebase rules auto-deploy from CI

GitHub repo → Settings → Secrets and variables → Actions → add:

| Secret | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | the **entire contents** of `service-account.json` from step 7 |
| `FIREBASE_PROJECT_ID` | your Firebase project id |

Now every push to `main` redeploys `firestore.rules` / indexes / `storage.rules`.

---

## 14. 🌐 Branch protection (recommended)

GitHub repo → Settings → **Branches** → Add rule for `main`:

- Require a pull request before merging
- Require status checks to pass → select **CI / Lint · Typecheck · Test · Build**

---

## 15. ✅ Verify end-to-end

On the production URL:

1. Sign up (email) and sign up (Google) — both create a user.
2. "Become an author" → create a bilingual profile with a photo → publish a book with a
   cover (upload should compress + succeed).
3. Leave a rating + review; leave a **guest** review in a private window.
4. Home page: "Best reviewed books" re-orders after the review.
5. `/admin`: work a reported review, toggle a verified badge, grant the author role to a
   user — each appears in the audit log; a non-admin gets a 404 on `/admin`.
6. Toggle dark mode and the සිංහල/English switch; check on a phone.

Full checklist: [`.claude/planning/09-roadmap.md`](.claude/planning/09-roadmap.md).

---

## Quick reference — where each value goes

| Value | `.env.local` | Vercel env | GitHub secret |
|---|:--:|:--:|:--:|
| `VITE_FIREBASE_*` (6) | ✔ | ✔ | — |
| `VITE_APPCHECK_SITE_KEY` | ✔ | ✔ | — |
| `VITE_APPCHECK_DEBUG_TOKEN` | ✔ (dev only) | — | — |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | — | — | ✔ (Option B) |
| `FIREBASE_SERVICE_ACCOUNT` / `FIREBASE_PROJECT_ID` | — | — | ✔ (CI rules deploy) |
| `service-account.json` | file in repo root (git-ignored) | — | — |
