import 'server-only'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL must be configured before using the database client.')
}

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool
}

export const pool = globalForPostgres.postgresPool ?? new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.postgresPool = pool
}

export const db = drizzle(pool, { schema })
