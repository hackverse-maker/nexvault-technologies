import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mediaLibrary, products } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { saveProductAction, deleteProductAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Products — NexVault Admin' }

const statusTone = { active: 'green', draft: 'amber', archived: 'slate' } as const

export default async function AdminProductsPage() {
  const [items, media] = await Promise.all([
    db.query.products.findMany({ orderBy: [asc(products.sortOrder), asc(products.name)] }),
    db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.originalName)] }),
  ])
  const mediaOptions = media.map((m) => ({ id: m.id, label: m.originalName }))

  return (
    <>
      <PageHeader title="Products Management" description="Products and packages offered through the website, including pricing." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Products ({items.length})</h2>
          {items.length === 0 ? (
            <EmptyState text="No products yet. Create your first product package." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Name', 'Price', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((product) => (
                    <tr key={product.id}>
                      <td style={tdStyle}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>/{product.slug}</p>
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                          <ProductForm product={product} compact mediaOptions={mediaOptions} />
                        </details>
                      </td>
                      <td style={tdStyle}>{product.currency} {Number(product.price).toLocaleString()}</td>
                      <td style={tdStyle}><Badge tone={statusTone[product.status as keyof typeof statusTone] ?? 'slate'}>{product.status}</Badge></td>
                      <td style={tdStyle}>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button type="submit" style={dangerBtn}>Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Add product</h2>
          <ProductForm mediaOptions={mediaOptions} />
        </Card>
      </div>
    </>
  )
}

function ProductForm({
  product,
  compact = false,
  mediaOptions = [],
}: {
  product?: {
    id: string
    name: string
    slug: string
    description: string
    price: string
    currency: string
    status: string
    sortOrder: number
    mediaId: string | null
  }
  compact?: boolean
  mediaOptions?: { id: string; label: string }[]
}) {
  return (
    <form
      action={saveProductAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, minWidth: compact ? 280 : 'auto' }}
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Name<input name="name" required defaultValue={product?.name} placeholder="Gold Package" style={inputStyle} /></label>
        <label style={labelStyle}>Slug<input name="slug" required defaultValue={product?.slug} placeholder="gold-package" style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>Description<textarea name="description" rows={2} defaultValue={product?.description} placeholder="What this product includes" style={{ ...inputStyle, resize: 'vertical' }} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Price<input name="price" type="number" step="0.01" min={0} required defaultValue={product?.price} placeholder="26991" style={inputStyle} /></label>
        <label style={labelStyle}>Currency<input name="currency" defaultValue={product?.currency ?? 'PKR'} placeholder="PKR" style={inputStyle} /></label>
        <label style={labelStyle}>Status
          <select name="status" defaultValue={product?.status ?? 'draft'} style={inputStyle}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} style={inputStyle} /></label>
      <label style={labelStyle}>Product image
        <select name="mediaId" defaultValue={product?.mediaId ?? ''} style={inputStyle}>
          <option value="">— No image —</option>
          {mediaOptions.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {mediaOptions.length === 0 && <span style={{ color: '#5f7a99', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>Upload images in Media Library first.</span>}
      </label>
      <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {product ? 'Save product' : 'Add product'}
      </button>
    </form>
  )
}

const dangerBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(240,163,163,.3)',
  color: '#f0a3a3',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
}
