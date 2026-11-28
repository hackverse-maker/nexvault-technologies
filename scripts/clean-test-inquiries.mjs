import { config } from 'dotenv'
config({ path: '.env.local' })
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rowCount } = await pool.query(
  `delete from contact_inquiries where email in ('test@example.com','t2@example.com','subj@example.com','direct@example.com','direct2@example.com','b@b.co')`,
)
console.log('deleted', rowCount)
await pool.end()
