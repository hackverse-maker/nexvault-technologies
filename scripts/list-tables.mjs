import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const { rows } = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1",
)
console.log(rows.map((r) => r.table_name).join(', '))
await pool.end()
