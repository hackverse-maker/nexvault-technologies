import nextEnv from '@next/env'
import { scryptSync } from 'node:crypto'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const { rows } = await pool.query(
  `SELECT a.password FROM account a JOIN "user" u ON u.id = a."userId"
   WHERE u.email = 'admin@nexvault.local' AND a."providerId" = 'credential'`,
)
const [scheme, salt, hash] = rows[0].password.split('$')
const derived = scryptSync(process.env.ADMIN_PASSWORD, salt, 64).toString('hex')
console.log('password verify:', derived === hash)
const admins = await pool.query(
  `SELECT au.role, au.is_active FROM admin_users au JOIN "user" u ON u.id = au.user_id WHERE u.email = 'admin@nexvault.local'`,
)
console.log('admin_users:', JSON.stringify(admins.rows))
await pool.end()
