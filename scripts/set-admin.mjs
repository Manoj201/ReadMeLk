#!/usr/bin/env node
/**
 * One-time ops: grant/revoke the `admin` custom claim.
 * There is intentionally no in-app path for this (see 08-security-and-moderation.md).
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   node scripts/set-admin.mjs <uid> [--revoke]
 *
 * Requires `firebase-admin` (add as a dev dependency when you need it):
 *   yarn add -D firebase-admin
 * The service-account key must NOT be committed.
 */
const [, , uid, flag] = process.argv
if (!uid) {
  console.error('Usage: node scripts/set-admin.mjs <uid> [--revoke]')
  process.exit(1)
}

const { initializeApp, applicationDefault } = await import('firebase-admin/app')
const { getAuth } = await import('firebase-admin/auth')

initializeApp({ credential: applicationDefault() })

const admin = flag !== '--revoke'
await getAuth().setCustomUserClaims(uid, admin ? { admin: true } : {})
console.log(`${admin ? 'granted' : 'revoked'} admin for ${uid}. The user must re-auth to refresh their token.`)
