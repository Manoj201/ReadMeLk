# ReadMe — Planning

**Status: planning complete / implementation not started.**

This folder is the single source of truth for what ReadMe is and how it will be built.
Everything here is design intent — no application code exists yet.

## Read in this order

| # | Doc | What it covers |
|---|---|---|
| 01 | [01-overview.md](01-overview.md) | Vision, personas, in/out of scope, success signals, glossary |
| 02 | [02-architecture.md](02-architecture.md) | Stack, folder structure, state strategy, routing, rating math, deploy |
| 03 | [03-data-model.md](03-data-model.md) | Firestore collections & schemas, aggregate transactions, indexes, Storage layout |
| 04 | [04-features-user-stories.md](04-features-user-stories.md) | Epics → user stories → acceptance criteria |
| 05 | [05-i18n.md](05-i18n.md) | Sinhala/English strategy, translation keys vs bilingual content, fonts |
| 06 | [06-design-system.md](06-design-system.md) | Sri Lankan heritage theme: palette, typography, motifs, design tokens |
| 07 | [07-firebase-setup.md](07-firebase-setup.md) | Firebase project setup, env vars, `firestore.rules`, `storage.rules`, indexes |
| 08 | [08-security-and-moderation.md](08-security-and-moderation.md) | Roles, guest handling, reporting, admin queue, abuse limits |
| 09 | [09-roadmap.md](09-roadmap.md) | Milestones M0–M6 with a Definition of Done, plus a manual E2E checklist |

## Confirmed decisions

- **Firebase scope:** Firestore + Auth + Storage only. No Cloud Functions. Free Spark plan.
  Aggregates maintained via client-side transactions.
- **Auth:** Email/password + Google sign-in for registered users (one account type, roles
  layered on top). Guest review = no login, name only, `isGuest: true`.
- **Moderation:** Trust-on-write. Profiles and books publish immediately. `report` action +
  lightweight admin queue. Admin role via manual custom claim (CLI script only).
- **Admin:** `/admin` dashboard for moderation, author verification/featuring, content
  editing, and `author`-role management, backed by an immutable `adminActions` audit log.
- **Package manager:** Yarn.

## Where to start implementing

Milestone **M0 — Scaffold** in [09-roadmap.md](09-roadmap.md). A fresh contributor should be
able to begin using only `CLAUDE.md` and this folder.
