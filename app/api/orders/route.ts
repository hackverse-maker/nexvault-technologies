import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { findRecentDuplicate, generateOrderNumber, getOrderableProduct, orderAmounts } from '@/lib/orders'
import { digitsOnly } from '@/lib/whatsapp'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s\-()]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const plan = String(body.plan ?? '').trim()
    const name = String(body.name ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const paymentMethod = String(body.paymentMethod ?? '').trim()
    const honeypot = String(body.website ?? '').trim()
    const elapsed = Number(body.ts) ? Date.now() - Number(body.ts) : Infinity

    // Honeypot filled or impossibly fast submission — silently accept.
    if (honeypot || (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000)) {
      return NextResponse.json({ ok: true, orderNumber: null })
    }

    if (!plan) {
      return NextResponse.json({ error: 'Please select a plan.' }, { status: 400 })
    }
    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
    }
    const phoneDigits = digitsOnly(phone)
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || !PHONE_RE.test(phone)) {
      return NextResponse.json({ error: 'Enter a valid phone number (7–15 digits).' }, { status: 400 })
    }
    if (email && (email.length > 160 || !EMAIL_RE.test(email))) {
      return NextResponse.json({ error: 'Enter a valid email address or leave it blank.' }, { status: 400 })
    }
    if (paymentMethod !== 'cash' && paymentMethod !== 'online') {
      return NextResponse.json({ error: 'Please choose a payment method.' }, { status: 400 })
    }

    // Verify the plan and price against the database — never trust the client.
    const product = await getOrderableProduct(plan)
    if (!product || product.status !== 'active') {
      return NextResponse.json({ error: 'That plan is no longer available.' }, { status: 400 })
    }
    const amounts = orderAmounts(product)

    // Idempotent-ish: return the existing order if the same customer+plan
    // was submitted within the last minute (double-click / retry safety).
    const duplicate = await findRecentDuplicate(phoneDigits, product.id)
    if (duplicate) {
      return NextResponse.json({ ok: true, orderNumber: duplicate.orderNumber })
    }

    const orderNumber = generateOrderNumber()
    await db.insert(orders).values({
      orderNumber,
      customerName: name,
      phoneNumber: phoneDigits,
      email: email || null,
      productId: product.id,
      planName: product.name,
      planPrice: amounts.planPrice.toFixed(2),
      comparePrice: amounts.comparePrice != null ? amounts.comparePrice.toFixed(2) : null,
      discountAmount: amounts.discountAmount.toFixed(2),
      currency: amounts.currency,
      finalAmount: amounts.finalAmount.toFixed(2),
      advanceAmount: amounts.advanceAmount.toFixed(2),
      balanceAmount: amounts.balanceAmount.toFixed(2),
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'pending_verification' : 'unpaid',
      orderStatus: 'pending',
    })

    return NextResponse.json({ ok: true, orderNumber })
  } catch (error) {
    console.error('Order creation failed:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
