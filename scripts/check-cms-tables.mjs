import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const tables = [
  'website_settings', 'contact_information', 'social_media_links',
  'header_settings', 'footer_configuration', 'footer_columns',
  'navigation_items', 'contact_inquiries', 'activity_logs',
]
for (const t of tables) {
  const { rows } = await pool.query(`SELECT count(*)::int AS c FROM ${t}`)
  console.log(`${t}: ${rows[0].c}`)
}
await pool.end()
