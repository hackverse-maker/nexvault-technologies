import nextEnv from '@next/env'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('Database check failed: DATABASE_URL is not configured.')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 5_000,
})
const db = drizzle(pool)

try {
  const { rows } = await db.execute(
    sql`SELECT current_database() AS database_name, current_timestamp AS checked_at`,
  )
  console.log(`Connected to PostgreSQL database "${rows[0].database_name}".`)
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? ` (code ${error.code})` : ''
  console.error(`Database connection failed${code}. Check DATABASE_URL and the Neon integration status.`)
  process.exitCode = 1
} finally {
  await pool.end()
}
