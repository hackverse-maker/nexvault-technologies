import 'server-only'

import { randomInt } from 'node:crypto'
import { eq, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, products } from '@/lib/db/schema'
import type { CatalogProduct } from '@/lib/catalog'

export const ADVANCE_PERCENT = 50

export type OrderAmounts = {
  planPrice: number
  comparePrice: number | null
  discountAmount: number
  discountPercent: number | null
  finalAmount: number
  advanceAmount: number
  balanceAmount: number
  currency: string
}

/** Look up a purchasable product by slug or exact name. */
export async function getOrderableProduct(plan: string): Promise<CatalogProduct | null> {
  const value = plan.trim()
  if (!value) return null
  const product = await db.query.products.findFirst({
    where: or(eq(products.slug, value.toLowerCase()), eq(products.name, value)),
  })
  return product ?? null
}

/** All money math happens here on the server — never trust client amounts. */
export function orderAmounts(product: CatalogProduct): OrderAmounts {
  const planPrice = Number(product.price) || 0
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null
  const hasDiscount = comparePrice != null && comparePrice > planPrice
  const discountAmount = hasDiscount ? comparePrice - planPrice : 0
  const advanceAmount = Math.round(planPrice * ADVANCE_PERCENT) / 100
  return {
    planPrice,
    comparePrice: hasDiscount ? comparePrice : null,
    discountAmount,
    discountPercent: hasDiscount ? Math.round((discountAmount / comparePrice) * 100) : null,
    finalAmount: planPrice,
    advanceAmount,
    balanceAmount: Math.round((planPrice - advanceAmount) * 100) / 100,
    currency: product.currency || 'PKR',
  }
}

export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const rand = randomInt(0, 0xffffff).toString(16).toUpperCase().padStart(6, '0')
  return `NV-${date}-${rand}`
}

export async function findRecentDuplicate(phoneDigits: string, productId: string): Promise<{ orderNumber: string } | null> {
  const since = new Date(Date.now() - 60 * 1000)
  const row = await db.query.orders.findFirst({
    where: (o, { and, eq, gte }) =>
      and(eq(o.phoneNumber, phoneDigits), eq(o.productId, productId), gte(o.createdAt, since)),
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  })
  return row ? { orderNumber: row.orderNumber } : null
}
