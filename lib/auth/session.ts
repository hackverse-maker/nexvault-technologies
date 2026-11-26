import 'server-only'

import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { session, user, adminUsers } from '@/lib/db/schema'

export const SESSION_COOKIE = 'nv_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export type AdminSession = {
  userId: string
  email: string
  name: string
  adminUserId: string
  role: string
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const hdrs = await headers()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.insert(session).values({
    id: randomUUID(),
    token: tokenHash,
    userId,
    expiresAt,
    ipAddress: hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: hdrs.get('user-agent')?.slice(0, 500) ?? null,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      adminUserId: adminUsers.id,
      role: adminUsers.role,
    })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .innerJoin(adminUsers, eq(adminUsers.userId, user.id))
    .where(and(eq(session.token, hashToken(token)), gt(session.expiresAt, new Date()), eq(adminUsers.isActive, true)))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return { userId: row.userId, email: row.email, name: row.name, adminUserId: row.adminUserId, role: row.role }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.delete(session).where(eq(session.token, hashToken(token)))
  }
  store.delete(SESSION_COOKIE)
}
