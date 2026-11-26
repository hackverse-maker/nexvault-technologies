import 'server-only'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV !== 'test') {
  console.warn('DATABASE_URL is not configured — database queries will fail until it is set.')
}

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool
}

export const pool = globalForPostgres.postgresPool ?? new Pool({
  // Without DATABASE_URL, force a single-stack host so connection failures
  // surface as a plain error instead of an AggregateError (which breaks
  // Next.js dev error serialization and stalls requests).
  ...(connectionString ? { connectionString } : { host: '127.0.0.1' }),
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.postgresPool = pool
}

export const db = drizzle(pool, { schema })
