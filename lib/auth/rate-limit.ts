import 'server-only'

import { and, count, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { loginAttempts } from '@/lib/db/schema'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 1000 * 60 * 15 // 15 minutes

export async function isRateLimited(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS)
  const rows = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email.toLowerCase()),
        eq(loginAttempts.ip, ip),
        eq(loginAttempts.success, false),
        gt(loginAttempts.createdAt, since),
      ),
    )
  return (rows[0]?.value ?? 0) >= MAX_ATTEMPTS
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
  await db.insert(loginAttempts).values({ email: email.toLowerCase(), ip, success })
}
