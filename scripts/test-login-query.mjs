import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const { rows } = await pool.query(
  `SELECT u.id AS "userId", u.email, u.name, a.password AS "passwordHash",
          au.id AS "adminUserId", au.is_active AS "isActive"
   FROM "user" u
   INNER JOIN account a ON a."userId" = u.id
   INNER JOIN admin_users au ON au.user_id = u.id
   WHERE u.email = 'admin@nexvault.local' AND a."providerId" = 'credential'
   LIMIT 1`,
)
console.log('login query rows:', rows.length, rows[0] ? `(admin active: ${rows[0].isActive})` : '')
await pool.end()
