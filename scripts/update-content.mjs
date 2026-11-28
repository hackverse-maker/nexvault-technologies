// One-off content update: registers new stock images in the media library,
// enriches the portfolio section items (slug, tech, demo flag, images),
// and assigns unique hero background images to every CMS page.
// Run: node scripts/update-content.mjs
import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

const NEW_MEDIA = [
  { name: 'office-meeting.jpg', url: U('photo-1552664730-d307ca884978'), alt: 'Team meeting around a table in a modern office', tags: ['meeting', 'team'] },
  { name: 'strategy-planning.jpg', url: U('photo-1454165804606-c3d57bc86b40'), alt: 'Strategy planning with notebook and laptop', tags: ['strategy', 'planning'] },
  { name: 'writing-desk.jpg', url: U('photo-1434030216411-0b793f4b4173'), alt: 'Writer workspace with notebook and coffee', tags: ['writing', 'blog'] },
  { name: 'code-laptop.jpg', url: U('photo-1498050108023-c5249f4df085'), alt: 'Programming code on a laptop screen', tags: ['code', 'technology'] },
  { name: 'design-flatlay.jpg', url: U('photo-1561070791-2526d30994b5'), alt: 'Brand design flatlay with color swatches and sketches', tags: ['design', 'branding'] },
  { name: 'architecture-white.jpg', url: U('photo-1487958449943-2429e8be8625'), alt: 'Modern white architecture facade', tags: ['architecture', 'web'] },
  { name: 'furniture-store.jpg', url: U('photo-1555041469-a586c61ea9bc'), alt: 'Furniture storefront display', tags: ['ecommerce', 'retail'] },
  { name: 'minimal-chair.jpg', url: U('photo-1493663284031-b7e3aefcae8e'), alt: 'Minimal interior with a designer chair', tags: ['design', 'interior'] },
  { name: 'design-interior.jpg', url: U('photo-1524758631624-e2822e304c36'), alt: 'Design studio interior workspace', tags: ['design', 'workspace'] },
]

// page slug -> media_library original_name used as hero background
const HERO_BG = {
  about: 'office-meeting.jpg',
  services: 'developers-working.jpg',
  portfolio: 'design-flatlay.jpg',
  pricing: 'strategy-planning.jpg',
  blog: 'writing-desk.jpg',
  contact: 'business-meeting.jpg',
  'get-a-quote': 'team-laptops.jpg',
  'privacy-policy': 'code-screen.jpg',
  terms: 'code-laptop.jpg',
}

// Portfolio projects — all demonstration concepts (demo: true), no fake live links.
const PROJECTS = [
  { slug: 'northstar-studio', title: 'Northstar Studio', category: 'Business Websites', description: 'A confident digital home for an architecture practice with a point of view.', media: 'modern-office.jpg', tech: ['Next.js', 'Strategy', 'UI/UX'] },
  { slug: 'form-and-function', title: 'Form & Function', category: 'E-commerce', description: 'A considered shopping experience for a modern furniture label.', media: 'design-workspace.jpg', tech: ['E-commerce', 'Art Direction', 'SEO'] },
  { slug: 'local-foundry', title: 'Local Foundry', category: 'Digital Campaigns', description: 'A local growth system designed to connect a neighborhood brand with its next customers.', media: 'analytics-dashboard.jpg', tech: ['Local SEO', 'Google Ads', 'Content'] },
  { slug: 'meridian-row', title: 'Meridian Row', category: 'Business Websites', description: 'A refined corporate presence for a property group, built around clarity and credibility.', media: 'architecture-white.jpg', tech: ['Next.js', 'Responsive Design', 'SEO'] },
  { slug: 'copper-and-clay', title: 'Copper & Clay', category: 'E-commerce', description: 'A warm, product-first storefront concept for a homewares brand.', media: 'furniture-store.jpg', tech: ['E-commerce', 'UI/UX', 'Conversion Design'] },
  { slug: 'fieldnote-studio', title: 'Fieldnote Studio', category: 'UI/UX Design', description: 'A calm, editorial interface system for a research and notes product.', media: 'design-interior.jpg', tech: ['UI/UX', 'Design System', 'Prototyping'] },
  { slug: 'juniper-and-co', title: 'Juniper & Co', category: 'Branding', description: 'A minimal identity direction for a boutique wellness label.', media: 'minimal-chair.jpg', tech: ['Branding', 'Logo Design', 'Art Direction'] },
]

// ---------- media ----------
const mediaUrlByName = new Map()
async function loadMediaMap() {
  const { rows } = await pool.query('SELECT id, original_name FROM media_library')
  for (const r of rows) mediaUrlByName.set(r.original_name, `/api/img/${r.id}`)
}

async function ensureMedia() {
  for (const m of NEW_MEDIA) {
    const { rows } = await pool.query('SELECT id FROM media_library WHERE original_name = $1', [m.name])
    if (rows.length > 0) continue
    await pool.query(
      `INSERT INTO media_library (storage_provider, object_key, public_url, original_name, mime_type, byte_size, width, height, alt_text, caption, folder, tags)
       VALUES ('external', $1, $1, $2, 'image/jpeg', 1, NULL, NULL, $3, $3, 'stock', $4::jsonb)`,
      [m.url, m.name, m.alt, JSON.stringify(m.tags)],
    )
    console.log(`added media: ${m.name}`)
  }
  await loadMediaMap()
}

// ---------- portfolio section ----------
async function updatePortfolio() {
  const { rows } = await pool.query(
    `SELECT s.id, s.content FROM sections s JOIN pages p ON p.id = s.page_id
     WHERE p.slug = 'portfolio' AND s.section_type = 'portfolio' AND s.is_visible
     ORDER BY s.sort_order LIMIT 1`,
  )
  if (!rows.length) { console.log('portfolio section not found'); return }
  const items = PROJECTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: p.description,
    image: mediaUrlByName.get(p.media) ?? '',
    tech: p.tech,
    link: '',
    demo: true,
  }))
  await pool.query('UPDATE sections SET content = $2::jsonb, updated_at = now() WHERE id = $1', [
    rows[0].id,
    JSON.stringify({ ...(rows[0].content || {}), items }),
  ])
  console.log(`updated portfolio section with ${items.length} projects`)
}

// ---------- hero backgrounds ----------
async function updateHeroes() {
  for (const [slug, mediaName] of Object.entries(HERO_BG)) {
    const image = mediaUrlByName.get(mediaName)
    if (!image) { console.log(`missing media for ${slug}: ${mediaName}`); continue }
    const { rowCount } = await pool.query(
      `UPDATE sections s SET content = COALESCE(s.content, '{}'::jsonb) || jsonb_build_object('bgImage', $2::text), updated_at = now()
       FROM pages p WHERE s.page_id = p.id AND p.slug = $1 AND s.section_type = 'hero'`,
      [slug, image],
    )
    console.log(`hero bg ${slug}: ${rowCount} section(s) -> ${image}`)
  }
}

await ensureMedia()
await updatePortfolio()
await updateHeroes()
await pool.end()
console.log('done')
