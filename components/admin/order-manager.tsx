'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Mail, MessageCircle, Search, Trash2 } from 'lucide-react'
import { Badge, Card, EmptyState, inputStyle, labelStyle, tdStyle, thStyle } from './ui'
import { deleteOrderAction, updateOrderAction } from '@/app/admin/(panel)/actions'

export type OrderItem = {
  id: string
  orderNumber: string
  customerName: string
  phoneNumber: string
  email: string | null
  planName: string
  planPrice: number
  comparePrice: number | null
  discountAmount: number
  currency: string
  finalAmount: number
  advanceAmount: number
  balanceAmount: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  adminNotes: string | null
  createdAt: string
  formattedTotal: string
}

const ORDER_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const
const PAYMENT_STATUSES = ['unpaid', 'pending_verification', 'paid', 'failed', 'refunded'] as const
const PAYMENT_METHODS: Record<string, string> = { cash: 'Cash', online: 'Online' }

const orderTone = { pending: 'amber', confirmed: 'cyan', in_progress: 'cyan', completed: 'green', cancelled: 'red' } as const
const payTone = { unpaid: 'slate', pending_verification: 'amber', paid: 'green', failed: 'red', refunded: 'slate' } as const

const smallBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

export function OrderManager({ items }: { items: OrderItem[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [orderStatus, setOrderStatus] = useState<string>('all')
  const [payStatus, setPayStatus] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    for (const s of ORDER_STATUSES) c[`o:${s}`] = items.filter((i) => i.orderStatus === s).length
    for (const s of PAYMENT_STATUSES) c[`p:${s}`] = items.filter((i) => i.paymentStatus === s).length
    return c
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (orderStatus !== 'all' && i.orderStatus !== orderStatus) return false
      if (payStatus !== 'all' && i.paymentStatus !== payStatus) return false
      if (!q) return true
      return [i.orderNumber, i.customerName, i.phoneNumber, i.email, i.planName, i.paymentMethod]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [items, query, orderStatus, payStatus])

  function run(fn: (fd: FormData) => Promise<unknown>, fields: Record<string, string>) {
    startTransition(async () => {
      const fd = new FormData()
      for (const [k, v] of Object.entries(fields)) fd.set(k, v)
      await fn(fd)
      router.refresh()
    })
  }

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 15, margin: 0, flex: 1 }}>Orders ({filtered.length}{filtered.length !== items.length ? ` of ${items.length}` : ''})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, name, phone, plan…"
            style={{ ...inputStyle, width: 260, paddingLeft: 30, fontSize: 12 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 11 }}>
          <option value="all">All order statuses ({counts.all})</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')} ({counts[`o:${s}`] ?? 0})</option>)}
        </select>
        <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 11 }}>
          <option value="all">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')} ({counts[`p:${s}`] ?? 0})</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={items.length === 0 ? 'No orders yet.' : 'No orders match your filters.'} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Order', 'Customer', 'Plan', 'Amount', 'Payment', 'Status', 'Placed', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--cyan)', fontSize: 12 }}>{item.orderNumber}</p>
                    {item.email && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>{item.email}</p>}
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.customerName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8aa0b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageCircle size={10} /> {item.phoneNumber}
                    </p>
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{item.planName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>{PAYMENT_METHODS[item.paymentMethod] ?? item.paymentMethod}</p>
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.formattedTotal}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, color: '#70ddff' }}>
                      advance {item.currency} {item.advanceAmount.toLocaleString()} · balance {item.currency} {item.balanceAmount.toLocaleString()}
                    </p>
                    {item.comparePrice != null && item.discountAmount > 0 && (
                      <p style={{ margin: '3px 0 0', fontSize: 10, color: '#70e6ac' }}>
                        was {item.currency} {item.comparePrice.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <Badge tone={payTone[item.paymentStatus as keyof typeof payTone] ?? 'slate'}>{item.paymentStatus.replaceAll('_', ' ')}</Badge>
                  </td>
                  <td style={tdStyle}>
                    <Badge tone={orderTone[item.orderStatus as keyof typeof orderTone] ?? 'slate'}>{item.orderStatus.replaceAll('_', ' ')}</Badge>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 11, color: '#5f7a99', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={smallBtn} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                        {expanded === item.id ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> Details</>}
                      </button>
                      <details>
                        <summary style={{ ...smallBtn, listStyle: 'none', cursor: 'pointer' }}>Manage</summary>
                        <form action={updateOrderAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 250, position: 'relative' }}>
                          <input type="hidden" name="id" value={item.id} />
                          <label style={labelStyle}>Order status
                            <select name="orderStatus" defaultValue={item.orderStatus} style={inputStyle}>
                              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>Payment status
                            <select name="paymentStatus" defaultValue={item.paymentStatus} style={inputStyle}>
                              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>Admin notes<textarea name="adminNotes" rows={2} defaultValue={item.adminNotes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
                          <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }} disabled={pending}>Update</button>
                        </form>
                      </details>
                      <button style={{ ...smallBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }} disabled={pending}
                        onClick={() => { if (confirm(`Delete order ${item.orderNumber}?`)) run(deleteOrderAction, { id: item.id }) }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && expanded && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: 'rgba(0,140,255,.03)' }}>
          {(() => {
            const item = items.find((i) => i.id === expanded)
            if (!item) return null
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, fontSize: 13 }}>
                <div>
                  <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Order</p>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--cyan)' }}>{item.orderNumber}</p>
                  <p style={{ margin: '4px 0 0', color: '#8aa0b8' }}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Customer</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.customerName}</p>
                  <p style={{ margin: '4px 0 0', color: '#8aa0b8' }}>{item.phoneNumber}</p>
                  <p style={{ margin: '4px 0 0', color: '#8aa0b8' }}>{item.email || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Plan & pricing</p>
                  <p style={{ margin: 0 }}>{item.planName}</p>
                  <p style={{ margin: '4px 0 0', color: '#8aa0b8' }}>
                    {item.currency} {item.planPrice.toLocaleString()}
                    {item.comparePrice != null && item.discountAmount > 0 && (
                      <> · was {item.currency} {item.comparePrice.toLocaleString()} · discount {item.currency} {item.discountAmount.toLocaleString()}</>
                    )}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Payment</p>
                  <p style={{ margin: 0 }}>{PAYMENT_METHODS[item.paymentMethod] ?? item.paymentMethod} · {item.paymentStatus.replaceAll('_', ' ')}</p>
                  <p style={{ margin: '4px 0 0', color: '#8aa0b8' }}>Total: {item.formattedTotal}</p>
                  <p style={{ margin: '4px 0 0', color: '#70ddff' }}>50% advance: {item.currency} {item.advanceAmount.toLocaleString()} · balance: {item.currency} {item.balanceAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Notes</p>
                  <p style={{ margin: 0, color: '#8aa0b8' }}>{item.adminNotes || '—'}</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </Card>
  )
}
