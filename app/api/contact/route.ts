import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactInquiries, products, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const business = String(body.business ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const message = String(body.message ?? '').trim()
    const serviceTitle = String(body.service ?? '').trim()
    const packageName = String(body.package ?? '').trim()
    const subject = String(body.subject ?? '').trim().slice(0, 200)
    const honeypot = String(body.website ?? '').trim()
    const elapsed = Number(body.ts) ? Date.now() - Number(body.ts) : Infinity

    if (honeypot || (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000)) {
      // Honeypot filled or form submitted impossibly fast — silently accept.
      return NextResponse.json({ ok: true })
    }
    if (!name || !EMAIL_RE.test(email) || !message || message.length < 10 || message.length > 5000) {
      return NextResponse.json({ error: 'Please provide your name, a valid email, and a message (10–5000 characters).' }, { status: 400 })
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject is too long.' }, { status: 400 })
    }

    let serviceId: string | null = null
    if (serviceTitle) {
      const match = await db.query.services.findFirst({
        where: eq(services.title, serviceTitle),
      })
      serviceId = match?.id ?? null
    }

    let productId: string | null = null
    if (packageName) {
      const match = await db.query.products.findFirst({
        where: eq(products.name, packageName),
      })
      productId = match?.id ?? null
    }

    await db.insert(contactInquiries).values({
      fullName: name,
      email,
      businessName: business || null,
      phone: phone || null,
      subject: subject || null,
      message,
      requestedPackage: packageName || null,
      serviceId,
      productId,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
