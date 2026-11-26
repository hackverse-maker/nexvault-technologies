'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, activityLogs, adminUsers, user } from '@/lib/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createSession, destroySession } from '@/lib/auth/session'
import { isRateLimited, recordLoginAttempt } from '@/lib/auth/rate-limit'

export type LoginState = { error?: string }

const GENERIC_ERROR = 'Invalid email or password.'

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' }
  }

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown'

  try {
    if (await isRateLimited(email, ip)) {
      return { error: 'Too many failed attempts. Please try again in 15 minutes.' }
    }

    const rows = await db
      .select({
        userId: user.id,
        email: user.email,
        name: user.name,
        passwordHash: account.password,
        adminUserId: adminUsers.id,
        isActive: adminUsers.isActive,
      })
      .from(user)
      .innerJoin(account, eq(account.userId, user.id))
      .innerJoin(adminUsers, eq(adminUsers.userId, user.id))
      .where(and(eq(user.email, email), eq(account.providerId, 'credential')))
      .limit(1)

    const row = rows[0]
    const valid = row?.passwordHash ? await verifyPassword(password, row.passwordHash) : false

    if (!row || !valid || !row.isActive) {
      await recordLoginAttempt(email, ip, false)
      return { error: GENERIC_ERROR }
    }

    await recordLoginAttempt(email, ip, true)
    await createSession(row.userId)
    await db.insert(activityLogs).values({
      adminUserId: row.adminUserId,
      action: 'login',
      entityType: 'session',
      details: { email: row.email },
    })

    redirect('/admin')
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error
    return { error: 'Sign in is temporarily unavailable. Please try again.' }
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}
