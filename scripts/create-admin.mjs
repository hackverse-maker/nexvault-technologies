// Creates (or resets the password of) the first admin account.
//
// Usage:
//   1. Set DATABASE_URL in .env (same as the app).
//   2. Set ADMIN_EMAIL, ADMIN_PASSWORD, and optionally ADMIN_NAME.
//   3. Run:  pnpm db:create-admin   (or: node scripts/create-admin.mjs)
//
// Passwords are hashed with scrypt — the same format used by the app login.
// Never commit real credentials; pass them via environment variables only.

import nextEnv from '@next/env'
import { randomBytes, scrypt, randomUUID } from 'node:crypto'
import { promisify } from 'node:util'
import { Pool } from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''
const name = process.env.ADMIN_NAME || 'Administrator'
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not configured.')
  process.exit(1)
}
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Set ADMIN_EMAIL to a valid email address.')
  process.exit(1)
}
if (password.length < 10) {
  console.error('Set ADMIN_PASSWORD to a strong password (min 10 characters).')
  process.exit(1)
}

const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000 })

try {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: existing } = await client.query('SELECT id FROM "user" WHERE email = $1', [email])
    let userId = existing[0]?.id

    if (!userId) {
      userId = randomUUID()
      await client.query(
        'INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, now(), now())',
        [userId, name, email],
      )
      console.log(`Created user ${email}`)
    } else {
      console.log(`User ${email} already exists — updating credential password`)
    }

    const passwordHash = await hashPassword(password)
    const { rows: accountRows } = await client.query(
      'SELECT id FROM account WHERE "userId" = $1 AND "providerId" = \'credential\'',
      [userId],
    )
    if (accountRows[0]) {
      await client.query('UPDATE account SET password = $1, "updatedAt" = now() WHERE id = $2', [passwordHash, accountRows[0].id])
    } else {
      await client.query(
        'INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") VALUES ($1, $2, \'credential\', $3, $4, now(), now())',
        [randomUUID(), userId, userId, passwordHash],
      )
    }

    await client.query(
      `INSERT INTO admin_users (user_id, role, is_active, created_at, updated_at)
       VALUES ($1, 'admin', true, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET role = 'admin', is_active = true, updated_at = now()`,
      [userId],
    )

    await client.query('COMMIT')
    console.log(`Admin account ready: ${email} — sign in at /admin/login`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} catch (error) {
  console.error('Admin creation failed:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
