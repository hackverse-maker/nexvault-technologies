import nextEnv from '@next/env'
import fs from 'node:fs'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

const file = process.argv[2]
const sql = fs.readFileSync(file, 'utf8')

try {
  await pool.query(sql)
  const { rows } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('media_assignments','hero_slides','sliders','slider_slides') ORDER BY 1",
  )
  console.log('migration applied. tables:', rows.map((r) => r.table_name).join(', ') || '(none found)')
  const cols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='media_library' AND column_name IN ('caption','folder','tags','updated_at') ORDER BY 1",
  )
  console.log('media_library new cols:', cols.rows.map((r) => r.column_name).join(', ') || '(none)')
} catch (error) {
  console.error('migration failed:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
