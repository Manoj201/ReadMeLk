# 01 — Overview

## Vision

An accessible, bilingual online home for Sri Lankan book culture. Sinhala and English
readers can discover well-reviewed local books, learn about the authors behind them, and
contribute their own ratings and reviews — with or without an account. Authors get a
proper public presence: a full profile page plus a catalogue of their registered books.

## Primary personas

| Persona | Needs |
|---|---|
| **Author** | Create a rich bilingual profile; register/edit their books; see how readers rate them and their work. |
| **Registered Reader** | Sign in once; rate and review books and authors; edit their own reviews; be shown as a "verified reader". |
| **Guest Reader** | Leave a rating + review with just a name, no signup friction; clearly labelled as a guest. |
| **Admin / Moderator** | Work through reported reviews; remove or dismiss; grant the verified-author badge. |

## In scope (MVP)

- Author self-registration and full author profile page (bilingual bio, photo, cover,
  genres, book grid, rating summary, author-review list).
- Book registration by authors: bilingual title/description, cover upload, genre tags,
  language, metadata; edit/delete own books.
- Book reviews + star ratings.
- Author reviews + star ratings.
- Guest reviews vs registered reviews, visually distinguished.
- Home page "Best Reviewed Books" (Bayesian ranking), plus "Top Rated Authors" and
  "Recently Reviewed".
- Global Sinhala / English toggle, persisted across reloads.
- Report a review + an admin moderation queue to action reports.
- An **admin dashboard** (`/admin`) for moderators: platform counts, review removal /
  restore, author verification + featuring, editing/deleting any author or book, granting
  the `author` role to users, and an immutable audit log of every admin action.
- Light and dark theme, both carrying the Sri Lankan heritage design.

## Out of scope (v1)

- Purchases / e-commerce / price listings.
- Comment threads or replies on reviews.
- Social following, activity feeds, direct messaging.
- Publisher accounts.
- Native mobile apps.
- Tamil localization — the i18n structure stays ready for it, but it is not built.
- Cloud Functions and any server-side compute.
- Machine-learning recommendations; full-text search service (Algolia) — noted as future.
- Author "claim an existing profile" / identity verification workflow.
- In-app flow to create/promote **admins** — admin is a custom claim set via a CLI script
  ([08-security-and-moderation.md](08-security-and-moderation.md)).

## Success signals

- An author can go from signup → profile → first book published in under 5 minutes.
- A guest can submit a review in under 30 seconds with no account.
- The home "Best Reviewed Books" list visibly re-orders as new reviews arrive.
- Every screen is fully usable in both Sinhala and English.

## Glossary

| Term | Meaning |
|---|---|
| **Rating** | The 1–5 star score attached to a review. Always submitted together with a review in this product. |
| **Review** | Free-text opinion about a book or an author, with a rating and a stored language (`bodyLang`). |
| **Guest review** | A review submitted without authentication: `isGuest: true`, `guestName` set, `authorUid: null`. |
| **Verified reader** | A review written by a signed-in user. Shown with a distinct label; counted separately from guest reviews. |
| **Verified author** | A trust badge (`verified: true` on the author doc) an admin can grant. Not a gate — anyone can still publish. |
| **Aggregate** | Denormalized rating totals on a book/author doc (`ratingSum`, `ratingCount`, `ratingAvg`, `bayesianScore`, `reviewCount`) kept current by a client transaction. |
| **Bayesian score** | The ranking number for the home page: `(v/(v+m))*R + (m/(v+m))*C`, damping small vote counts. See [02-architecture.md](02-architecture.md). |
| **Trust-on-write** | Content is published immediately; moderation is reactive via reports, not a pre-publish gate. |
| **Audit log** (`adminActions`) | Append-only record of every mutating admin action (actor, action, target, time); the accountability backstop for broad admin write access. |
| **Featured** | Admin-set flag on a book/author that surfaces it on the home page; separate from `verified`. |
