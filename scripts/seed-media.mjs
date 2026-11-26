// Seeds the media library with real, licensed photography from Unsplash
// (Unsplash License — free for commercial use, no attribution required).
// Run: node scripts/seed-media.mjs
import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not configured.')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString, max: 1 })

// Real Unsplash photos (stable photo IDs), 1600px crop for web use.
const PHOTOS = [
  {
    id: 'photo-1497366216548-37526070297c',
    name: 'modern-office.jpg',
    alt: 'Modern office workspace with computers and natural light',
    folder: 'stock',
    tags: ['office', 'workspace', 'business'],
  },
  {
    id: 'photo-1460925895917-afdab827c52f',
    name: 'analytics-dashboard.jpg',
    alt: 'Laptop showing analytics and growth charts',
    folder: 'stock',
    tags: ['analytics', 'growth', 'marketing'],
  },
  {
    id: 'photo-1522071820081-009f0129c71c',
    name: 'team-collaboration.jpg',
    alt: 'Team collaborating around laptops in a meeting',
    folder: 'stock',
    tags: ['team', 'collaboration'],
  },
  {
    id: 'photo-1551434678-e076c223a692',
    name: 'developers-working.jpg',
    alt: 'Developers working on code together',
    folder: 'stock',
    tags: ['development', 'code', 'team'],
  },
  {
    id: 'photo-1557804506-669a67965ba0',
    name: 'design-workspace.jpg',
    alt: 'Designer workspace with sketches and tools',
    folder: 'stock',
    tags: ['design', 'creative'],
  },
  {
    id: 'photo-1547658719-da2b51169166',
    name: 'code-screen.jpg',
    alt: 'Programming code displayed on a monitor',
    folder: 'stock',
    tags: ['code', 'development', 'technology'],
  },
  {
    id: 'photo-1519389950473-47ba0277781c',
    name: 'team-laptops.jpg',
    alt: 'Team working together on laptops',
    folder: 'stock',
    tags: ['team', 'remote-work'],
  },
  {
    id: 'photo-1507238691740-187a5b1d37b8',
    name: 'design-desk.jpg',
    alt: 'Designer desk with color swatches and sketches',
    folder: 'stock',
    tags: ['design', 'branding'],
  },
  {
    id: 'photo-1553877522-43269d4ea984',
    name: 'business-meeting.jpg',
    alt: 'Business meeting with professionals discussing strategy',
    folder: 'stock',
    tags: ['meeting', 'strategy', 'business'],
  },
  {
    id: 'photo-1499951360447-b19be8fe80f8',
    name: 'workspace-laptop.jpg',
    alt: 'Laptop on a workspace with coffee and notebook',
    folder: 'stock',
    tags: ['workspace', 'freelance', 'business'],
  },
]

function unsplashUrl(id) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`
}

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const len = Number(res.headers.get('content-length'))
    return Number.isFinite(len) && len > 0 ? len : 250000
  } catch {
    return 250000
  }
}

const inserted = []

for (const photo of PHOTOS) {
  const publicUrl = unsplashUrl(photo.id)
  const existing = await pool.query('SELECT id FROM media_library WHERE object_key = $1', [publicUrl])
  if (existing.rows.length > 0) {
    console.log(`skip (exists): ${photo.name}`)
    inserted.push(existing.rows[0].id)
    continue
  }
  const byteSize = await head(publicUrl)
  const { rows } = await pool.query(
    `INSERT INTO media_library
       (storage_provider, object_key, public_url, original_name, mime_type, byte_size,
        width, height, alt_text, caption, folder, tags)
     VALUES ('external', $1, $1, $2, 'image/jpeg', $3, 1600, 1067, $4, $4, $5, $6::jsonb)
     RETURNING id`,
    [publicUrl, photo.name, byteSize, photo.alt, photo.folder, JSON.stringify(photo.tags)],
  )
  console.log(`added: ${photo.name}`)
  inserted.push(rows[0].id)
}

// Hero banner slides for the homepage backdrop (uses first 3 photos).
const heroSlidesSpec = [
  { mediaIndex: 0, title: 'BUILD', subtitle: 'Sharp websites and digital systems for ambitious businesses.', ctaLabel: "Let's work together", ctaHref: '/get-a-quote' },
  { mediaIndex: 3, title: 'DEVELOP', subtitle: 'Clean, fast code built to perform and scale.', ctaLabel: 'Our services', ctaHref: '/services' },
  { mediaIndex: 8, title: 'GROW', subtitle: 'Strategy and visibility that turn attention into revenue.', ctaLabel: 'View our work', ctaHref: '/portfolio' },
]

for (let i = 0; i < heroSlidesSpec.length; i++) {
  const spec = heroSlidesSpec[i]
  const mediaId = inserted[spec.mediaIndex]
  if (!mediaId) continue
  const dup = await pool.query('SELECT id FROM hero_slides WHERE media_id = $1 AND sort_order = $2', [mediaId, i])
  if (dup.rows.length > 0) continue
  await pool.query(
    `INSERT INTO hero_slides (media_id, title, subtitle, cta_label, cta_href, sort_order, is_visible)
     VALUES ($1, $2, $3, $4, $5, $6, true)`,
    [mediaId, spec.title, spec.subtitle, spec.ctaLabel, spec.ctaHref, i],
  )
  console.log(`hero slide ${i + 1} added`)
}

// A demo slider usable via the "Image slider" section type.
const sliderSlug = 'featured-work'
const sliderRes = await pool.query('SELECT id FROM sliders WHERE slug = $1', [sliderSlug])
let sliderId = sliderRes.rows[0]?.id
if (!sliderId) {
  const { rows } = await pool.query(
    `INSERT INTO sliders (name, slug, description, is_visible) VALUES ('Featured Work', $1, 'Project showcase slider seeded from the media library.', true) RETURNING id`,
    [sliderSlug],
  )
  sliderId = rows[0].id
  console.log('slider created: featured-work')
}
for (let i = 0; i < 3; i++) {
  const mediaId = inserted[i + 4]
  if (!mediaId) continue
  const dup = await pool.query('SELECT id FROM slider_slides WHERE slider_id = $1 AND media_id = $2', [sliderId, mediaId])
  if (dup.rows.length > 0) continue
  await pool.query(
    `INSERT INTO slider_slides (slider_id, media_id, title, caption, cta_label, cta_href, sort_order, is_visible)
     VALUES ($1, $2, $3, $4, 'View project', '/portfolio', $5, true)`,
    [sliderId, mediaId, ['Web presence', 'Product design', 'Growth campaign'][i], 'Seeded slider slide — replace with real project imagery.', i],
  )
}
console.log('slider slides ensured')

await pool.end()
console.log(`Done. ${inserted.length} media assets in library.`)
