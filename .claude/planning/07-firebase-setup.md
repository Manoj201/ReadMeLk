# 07 — Firebase setup

Firebase is used as a backend SaaS only: **Firestore + Auth + Storage**. No Cloud
Functions, no Firebase Hosting. Free Spark plan is sufficient.

## 1. Create the project

1. Firebase console → **Add project** → name `readme-lk` (or similar).
2. **Authentication** → Sign-in method → enable **Email/Password** and **Google**.
   - Add authorized domains: `localhost`, the Vercel preview domain, the production domain.
3. **Firestore Database** → Create → **Production mode** → location **`asia-south1`
   (Mumbai)** — closest region to Sri Lanka.
4. **Storage** → Get started → same region → start from the locked rules (replaced below).
5. Project settings → **Your apps** → register a **Web app** → copy the config values.
6. (Optional, recommended for a shared team) create a second project `readme-lk-dev` for
   non-production data, or use the Emulator Suite (below).

## 2. Environment variables

`.env.local` (git-ignored) for local dev, and the **Vercel project → Settings →
Environment Variables** for Preview + Production:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=readme-lk.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=readme-lk
VITE_FIREBASE_STORAGE_BUCKET=readme-lk.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`.gitignore` must include:

```
node_modules/
dist/
.env
.env.*.local
.firebase/
*.log
```

Commit `.env.example` with the keys and empty values.

## 3. `src/lib/firebase.ts`

```ts
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
```

## 4. Local emulators (optional but recommended)

`firebase.json`:

```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage": { "rules": "storage.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

`yarn firebase emulators:start` with `VITE_USE_EMULATORS=true yarn dev`. Seed script
(`scripts/seed.ts`, M5) targets the emulator.

## 5. `firestore.rules` — first-draft

```
rules_version = '2';
service cloud.firestore {
  function isSignedIn()  { return request.auth != null; }
  function uid()         { return request.auth.uid; }
  function isAdmin()     { return isSignedIn() && request.auth.token.admin == true; }
  function existingUser(){ return get(/databases/$(database)/documents/users/$(uid())).data; }
  function isAuthor()    { return isSignedIn() && ('author' in existingUser().roles); }

  match /databases/{database}/documents {

    // ---- users -------------------------------------------------------------
    // `roles` may only ever contain 'reader' and/or 'author' here. The 'admin'
    // capability is the custom claim `request.auth.token.admin`, set out-of-band
    // by scripts/set-admin.ts — it is NOT represented in this array and must not
    // be writable from the client.
    function rolesAreSafe(r) {
      return r.hasOnly(['reader', 'author']) && ('reader' in r);
    }
    match /users/{userId} {
      allow read: if true;                       // profile is public (email never rendered)
      allow create: if isSignedIn() && userId == uid()
                    && request.resource.data.roles == ['reader'];
      // self: may edit own profile + self-upgrade to author, never touch 'admin'
      allow update: if ( userId == uid()
                         && rolesAreSafe(request.resource.data.roles) )
                    // admin: may grant/revoke the 'author' role (and edit),
                    // still cannot introduce 'admin' via the doc
                    || ( isAdmin()
                         && rolesAreSafe(request.resource.data.roles) );
      allow delete: if isAdmin();
    }

    // ---- authors ---------------------------------------------------------
    function authorAggFields() {
      return ['ratingSum','ratingCount','ratingAvg','bayesianScore','reviewCount','bookCount','updatedAt'];
    }
    match /authors/{authorId} {
      allow read: if true;
      allow create: if isSignedIn()
                    && request.resource.data.ownerUid == uid()
                    && request.resource.data.verified == false
                    && request.resource.data.featured == false
                    && request.resource.data.ratingCount == 0
                    && request.resource.data.bookCount == 0;
      // owner edits profile fields but NOT aggregates, `verified`, or `featured`
      allow update: if isAdmin()
                    || ( resource.data.ownerUid == uid()
                         && request.resource.data.verified == resource.data.verified
                         && request.resource.data.featured == resource.data.featured
                         && !request.resource.data.diff(resource.data)
                              .affectedKeys().hasAny(['ratingSum','ratingCount','ratingAvg','bayesianScore','reviewCount']) )
                    // OR an aggregate-only bump from the review transaction
                    || ( isSignedIn()
                         && request.resource.data.diff(resource.data).affectedKeys()
                              .hasOnly(authorAggFields())
                         && aggregateDeltaOk(resource.data, request.resource.data) );
      allow delete: if resource.data.ownerUid == uid() || isAdmin();
    }

    // ---- books ---------------------------------------------------------
    function bookAggFields() {
      return ['ratingSum','ratingCount','ratingAvg','bayesianScore','reviewCount','updatedAt'];
    }
    match /books/{bookId} {
      allow read: if true;
      allow create: if isAuthor()
                    && request.resource.data.ownerUid == uid()
                    && request.resource.data.featured == false
                    && request.resource.data.ratingCount == 0;
      // owner edits book fields but NOT aggregates or `featured`
      allow update: if isAdmin()
                    || ( resource.data.ownerUid == uid()
                         && request.resource.data.featured == resource.data.featured
                         && !request.resource.data.diff(resource.data)
                              .affectedKeys().hasAny(['ratingSum','ratingCount','ratingAvg','bayesianScore','reviewCount']) )
                    || ( isSignedIn()
                         && request.resource.data.diff(resource.data).affectedKeys()
                              .hasOnly(bookAggFields())
                         && aggregateDeltaOk(resource.data, request.resource.data) );
      allow delete: if resource.data.ownerUid == uid() || isAdmin();
    }

    // Constrain how far a single client write can move aggregates.
    function aggregateDeltaOk(oldD, newD) {
      return newD.ratingCount >= 0
        && (newD.ratingCount - oldD.ratingCount) >= -1
        && (newD.ratingCount - oldD.ratingCount) <= 1
        && newD.ratingAvg >= 0 && newD.ratingAvg <= 5
        && newD.bayesianScore >= 0 && newD.bayesianScore <= 5
        && (newD.ratingSum - oldD.ratingSum) >= -5
        && (newD.ratingSum - oldD.ratingSum) <= 5;
    }

    // ---- reviews -----------------------------------------------------------
    match /reviews/{reviewId} {
      allow read: if resource.data.status == 'published' || isAdmin()
                  || (isSignedIn() && resource.data.authorUid == uid());

      allow create: if
        // verified review: deterministic id, tied to the caller
        ( isSignedIn()
          && request.resource.data.isGuest == false
          && request.resource.data.authorUid == uid()
          && reviewId == request.resource.data.targetId + '_' + uid()
          && request.resource.data.rating is int
          && request.resource.data.rating >= 1 && request.resource.data.rating <= 5
          && request.resource.data.status == 'published' )
        ||
        // guest review: no auth, name required, not attributable
        ( request.resource.data.isGuest == true
          && request.resource.data.authorUid == null
          && request.resource.data.guestName is string
          && request.resource.data.guestName.size() >= 2
          && request.resource.data.rating >= 1 && request.resource.data.rating <= 5
          && request.resource.data.status == 'published' );

      allow update: if isAdmin()
                    || ( isSignedIn() && resource.data.authorUid == uid()
                         && request.resource.data.authorUid == resource.data.authorUid
                         && request.resource.data.isGuest == resource.data.isGuest );
      allow delete: if isAdmin() || (isSignedIn() && resource.data.authorUid == uid());
    }

    // ---- reports ---------------------------------------------------------
    match /reports/{reportId} {
      allow create: if request.resource.data.status == 'open'
                    && request.resource.data.reviewId is string;
      allow read, update: if isAdmin();
      allow delete: if false;                     // keep the moderation trail
    }

    // ---- adminActions (immutable audit log) ------------------------------
    match /adminActions/{actionId} {
      allow read: if isAdmin();
      allow create: if isAdmin()
                    && request.resource.data.actorUid == uid()
                    && request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

Notes / known limits:
- Aggregate writes are *bounded*, not *authenticated*. A determined signed-in client could
  still nudge a rating within the per-write limits. Acceptable for v1; hardened later with
  Cloud Functions + App Check (post-v1, [09-roadmap.md](09-roadmap.md)).
- `isAuthor()` / `existingUser()` add a `get()` read per book write — fine at this scale.
- Guest review throttling is **client-side only** (cooldown + honeypot); rules cannot see
  request rate. Revisit with App Check.

## 6. `storage.rules`

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function ownsAuthor(authorId) {
      return isSignedIn()
        && firestore.get(/databases/(default)/documents/authors/$(authorId)).data.ownerUid == request.auth.uid;
    }
    function ownsBook(bookId) {
      return isSignedIn()
        && firestore.get(/databases/(default)/documents/books/$(bookId)).data.ownerUid == request.auth.uid;
    }
    function validImage() {
      return request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /authorPhotos/{authorId}/{file} {
      allow read: if true;
      allow write: if ownsAuthor(authorId) && validImage();
    }
    match /bookCovers/{bookId}/{file} {
      allow read: if true;
      allow write: if ownsBook(bookId) && validImage();
    }
  }
}
```

Upload flow: create the Firestore doc first (so ownership exists), then upload the image to
the id-scoped path, then write the returned `downloadURL` back to the doc.

## 7. `firestore.indexes.json`

Encode the composite indexes from [03-data-model.md](03-data-model.md). Deploy with
`yarn firebase deploy --only firestore:indexes,firestore:rules,storage`.

## 8. Admin role (one-time ops)

There are no Functions, so custom claims are set out-of-band:

- `scripts/set-admin.ts` — a Node script using `firebase-admin` with a service-account key
  (kept out of the repo) that runs `getAuth().setCustomUserClaims(uid, { admin: true })`.
- Document the target uids in a private ops note, not in the repo.
- The user must sign out/in (or force token refresh) for the claim to take effect.
