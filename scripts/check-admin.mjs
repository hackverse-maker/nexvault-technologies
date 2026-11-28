import { config } from 'dotenv'
config({ path: '.env.local' })
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
try {
  const r = await pool.query('select email, name from "user"')
  console.log('users:', JSON.stringify(r.rows, null, 1))
  const a = await pool.query('select role, is_active from admin_users')
  console.log('admin_users:', JSON.stringify(a.rows, null, 1))
} catch (e) {
  console.log('ERR', e.message)
}
await pool.end()
