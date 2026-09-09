# 08 — Security & moderation

Companion to the rules in [07-firebase-setup.md](07-firebase-setup.md). Covers roles,
guest handling, reporting, the admin queue, and the honest limits of a
no-Cloud-Functions design.

## Roles

| Role | How it is granted | Checked in |
|---|---|---|
| `reader` | default, set on `users` doc creation | client (UI), rules (`create` forces `['reader']`) |
| `author` | self-serve: "Become an author" adds `'author'` to `roles` | client guard on `/books/new`, rules `isAuthor()` for book create |
| `admin` | **manual** custom claim `admin: true` via `scripts/set-admin.ts` | client `RequireRole`, rules `isAdmin()` |

`authStore.user.roles` is the synchronous source for UI gating; rules re-check server-side.
The `author` self-upgrade is intentionally frictionless (trust-on-write); the only
protected role is `admin`.

### How `admin` is granted (no UI path)

`admin` is a **Firebase custom claim** (`request.auth.token.admin == true`), never a value
in the `users.roles` array. It is set only by `scripts/set-admin.ts` (a local
`firebase-admin` script run with a service-account key kept out of the repo), documented in
a private ops note. The user must refresh their ID token (sign out/in) for it to take
effect. Security rules explicitly prevent the client — even an existing admin — from
writing `'admin'` into `users.roles` (`rolesAreSafe()` in
[07-firebase-setup.md](07-firebase-setup.md)), so the audit-logged in-app admin tools
cannot escalate anyone to admin. Adding an in-app invite flow later still requires a
Function to call `setCustomUserClaims` (post-v1).

## Admin area — capabilities & enforcement

All `/admin*` routes sit under `RequireRole role="admin"` (renders NotFound for everyone
else). Client guards are convenience; the table below is what the **security rules**
actually permit, and every mutating action also writes an immutable `adminActions` doc
([03-data-model.md](03-data-model.md)) via `logAdminAction()` in the same batch/transaction.

| Admin action | Route | Rule that allows it | Audit `action` |
|---|---|---|---|
| View platform counts + recent actions | `/admin` | `adminActions` read = `isAdmin()`; counts via `getCountFromServer` on world-readable collections | — |
| Remove a review (from report or review list) | `/admin/reports`, `/admin/reviews` | `reviews` update/delete `if isAdmin()`; aggregate unwind via the review-delete transaction | `review.remove` |
| Restore a removed review | `/admin/reviews` | same; re-applies aggregates | `review.restore` |
| Dismiss a report | `/admin/reports` | `reports` update `if isAdmin()` | `report.dismiss` |
| Verify / unverify an author | `/admin/authors` | `authors` update `if isAdmin()` (owner branch forbids changing `verified`) | `author.verify` / `author.unverify` |
| Feature / unfeature an author or book | `/admin/authors`, `/admin/books` | `authors`/`books` update `if isAdmin()` (owner branch forbids `featured`) | `*.feature` / `*.unfeature` |
| Edit / delete any author or book | `/admin/authors`, `/admin/books` | `authors`/`books` update & delete `if isAdmin()`; book delete decrements `authors.bookCount` | `author.edit`/`author.delete`/`book.edit`/`book.delete` |
| Grant / revoke the `author` role on a user | `/admin/users` | `users` update `if isAdmin() && rolesAreSafe(...)` | `user.grantAuthor` / `user.revokeAuthor` |
| View who is `admin` | `/admin/users` | read-only; `admin` is a claim, shown for reference only | — |

Not possible from the app (by design): creating/removing an `admin`; hard-deleting a
review, report, or `adminActions` doc; back-dating an audit entry
(`createdAt == request.time` is enforced).

## Guest reviews

- No authentication. Stored with `isGuest: true`, `guestName` (≥ 2 chars, required),
  `authorUid: null`, auto-generated id.
- **Rating impact:** guest ratings **are** included in `ratingSum` / `ratingCount` /
  `ratingAvg` / `bayesianScore` so the score reflects all readers. They are **excluded**
  from `reviewCount` (which tracks verified reviews) and are labelled "Guest" in the UI.
  - Alternative considered: keep a separate `guestRatingSum`/`guestRatingAvg` and show two
    numbers. Rejected for v1 as more surface for little gain; revisit if guest spam
    distorts scores.
- **Abuse controls (client-side only):**
  - Per-target cooldown in `localStorage` (`readme.guestReview.<targetId>` timestamp) —
    one guest review per target per browser per 10 minutes.
  - Hidden honeypot input in `ReviewForm`; a filled honeypot silently drops the submit.
  - `guestName` is free text shown publicly — the form warns "This name will be shown
    publicly".
  - Optional hCaptcha/Turnstile on the guest branch — noted as **[1.1]**, needs a script
    allowance and adds a dependency.
- Rules cannot rate-limit or verify a human, so the above is best-effort. App Check would
  raise the floor (post-v1).

## Reporting

- Anyone (including guests) can create a `reports` doc: `{ reviewId, targetType, targetId,
  reason, note, reporterUid|null, status: 'open' }`.
- Rules: `create` allowed for all when `status == 'open'` and `reviewId` is a string;
  `read`/`update`/`delete` admin-only. Reporters never see the queue.
- **[1.1]** Client best-effort: after N distinct reports on a review, flip its `status` to
  `'reported'` (still visible, but surfaced first in the queue). Not reliable without
  server compute — treat as a hint.

## Moderation queue — `/admin/reports`

- Lists `reports` where `status == 'open'`, oldest first (`createdAt` asc, indexed).
- Each row renders the offending review inline (admins can read any review via the rule
  `isAdmin()` branch) and links to the target book/author.
- Actions:
  - **Remove review** — runs the same review-delete transaction as a user deleting their
    own review: sets the review `status: 'removed'`, unwinds the aggregate contribution on
    the target, sets the report `status: 'actioned'`, `actionedBy`, `actionedAt`, and
    writes an `adminActions` doc — all in one transaction/batch. Removed reviews are
    retained (not hard-deleted) and filtered from all public lists; restorable from
    `/admin/reviews`.
  - **Dismiss** — report `status: 'dismissed'`, `actionedBy`, `actionedAt`; review
    untouched; logged.
- **[1.1]** Redact/edit a review instead of full removal; ban a repeat guest name pattern;
  auto-flip to `status:'reported'` after N distinct reports.

## Audit log — `adminActions`

- Append-only. `create` by admins only, with `actorUid == request.auth.uid` and
  `createdAt == request.time`; **no update, no delete** (rules deny both).
- Written in the same batch/transaction as the change it records, so an action and its log
  entry commit together or not at all.
- Surfaced on the `/admin` dashboard ("recent actions", `createdAt` desc) and per entity
  (`targetType` + `targetId` index) on the author/book/review admin views.
- This is the accountability backstop for a design where admins have broad write access.

## Privacy

- Public on `users`: `displayName`, `photoURL`, `roles` (needed for badges). **`email` is
  never rendered** anywhere in the UI, even though the doc is world-readable — if this
  matters more later, split public/private user docs.
- Reviews show `reviewerName` only (display name or guest name), never email or uid.
- Author `location` is free text the author opts into; no precise geodata.
- No analytics/tracking SDKs in v1.

## Integrity limits without Cloud Functions (be explicit)

| Risk | Current mitigation | Full fix (post-v1) |
|---|---|---|
| Client writes rating aggregates directly | Rules bound per-write deltas (`ratingCount` ±1, `ratingSum` ±5, values in range) | Move aggregation into an `onWrite` Function; deny client writes to aggregate fields |
| Guest review spam / ballot stuffing | localStorage cooldown + honeypot | App Check + optional captcha + Function-side rate limiting |
| Fake author profiles / books | Trust-on-write + report queue + `verified` badge | Manual verification workflow, email/domain checks |
| Someone scripts many `users` docs | Auth required to create; `roles` forced to `['reader']` | App Check; abuse monitoring |
| A rogue/compromised admin edits or deletes content broadly | Immutable `adminActions` audit log (no update/delete); `admin` grantable only via CLI + service-account key; rules block escalating anyone to `admin` from the client | Function-gated admin actions with approvals; alerting on the audit stream |
| Denormalized `reviewerName` goes stale after a rename | Accepted for v1 | Function backfill on user update |

These are acceptable for an MVP with low traffic and active moderation. The upgrade path
(Cloud Functions + App Check) is milestone **post-v1** in [09-roadmap.md](09-roadmap.md)
and does not require data-model changes — only tightening the rules and moving the
aggregate transaction server-side.
