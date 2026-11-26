import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const { rows } = await pool.query(
  "SELECT id, original_name, folder, storage_provider FROM media_library ORDER BY created_at LIMIT 5",
)
console.log(JSON.stringify(rows, null, 1))
const admins = await pool.query('SELECT count(*)::int AS c FROM admin_users')
console.log('admin_users:', admins.rows[0].c)
await pool.end()
