import { config } from 'dotenv'
config({ path: '.env.local' })
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query(
  'select full_name,email,subject,status,created_at from contact_inquiries order by created_at desc limit 5',
)
console.log(JSON.stringify(rows, null, 1))
await pool.end()
