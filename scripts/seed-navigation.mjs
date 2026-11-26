// Seeds navigation_items + footer_columns so header/footer are CMS-managed.
// Idempotent — clears and re-inserts.
// Run: node scripts/seed-navigation.mjs
import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })

const { rows: pageRows } = await pool.query('SELECT id, slug FROM pages')
const pageId = Object.fromEntries(pageRows.map((p) => [p.slug, p.id]))

const HEADER_NAV = ['about', 'services', 'portfolio', 'pricing', 'blog', 'contact']
const FOOTER_COLUMNS = [
  { title: 'Pages', links: [
    { label: 'Home', url: '/' },
    { label: 'About', slug: 'about' },
    { label: 'Portfolio', slug: 'portfolio' },
    { label: 'Pricing', slug: 'pricing' },
    { label: 'Blog', slug: 'blog' },
    { label: 'Contact', slug: 'contact' },
  ]},
  { title: 'Services', links: [
    { label: 'Web Design & Development', url: '/services/web-development' },
    { label: 'Search Engine Optimization', url: '/services/seo' },
    { label: 'Google Business Profile', url: '/services/google-business-profile' },
    { label: 'Google Ads Management', url: '/services/google-ads' },
    { label: 'Social Media Management', url: '/services/social-media' },
  ]},
  { title: 'Legal', links: [
    { label: 'Privacy Policy', slug: 'privacy-policy' },
    { label: 'Terms & Conditions', slug: 'terms' },
    { label: 'Get a Quote', slug: 'get-a-quote' },
  ]},
]

await pool.query('DELETE FROM navigation_items')
await pool.query('DELETE FROM footer_columns')

let order = 0
for (const slug of HEADER_NAV) {
  const label = slug === 'get-a-quote' ? 'Get a Quote' : slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
  await pool.query(
    `INSERT INTO navigation_items (label, location, target_page_id, target_url, sort_order, is_visible)
     VALUES ($1, 'header', $2, NULL, $3, true)`,
    [label, pageId[slug], order++],
  )
}

for (let c = 0; c < FOOTER_COLUMNS.length; c++) {
  const col = FOOTER_COLUMNS[c]
  const { rows } = await pool.query(
    'INSERT INTO footer_columns (title, sort_order, is_visible) VALUES ($1, $2, true) RETURNING id',
    [col.title, c],
  )
  const colId = rows[0].id
  for (const link of col.links) {
    const targetPageId = link.slug ? pageId[link.slug] ?? null : null
    const targetUrl = link.url ?? null
    await pool.query(
      `INSERT INTO navigation_items (label, location, target_page_id, target_url, footer_column_id, sort_order, is_visible)
       VALUES ($1, 'footer', $2, $3, $4, $5, true)`,
      [link.label, targetPageId, targetUrl, colId, order++],
    )
  }
}

console.log(`navigation_items + footer_columns seeded (${order} nav items)`)
await pool.end()
