// Step 11 seed: catalog fields for services/products + live-source sections.
import { config } from 'dotenv'
config({ path: '.env.local' })
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const serviceData = {
  'web-development': { category: 'Web', icon: 'Code2', home: true },
  'ecommerce': { category: 'Web', icon: 'ShoppingBag' },
  'google-business-profile': { category: 'Web', icon: 'Store', home: true },
  'local-seo': { category: 'Web', icon: 'Search' },
  'seo': { category: 'Visibility', icon: 'LineChart', home: true },
  'google-ads': { category: 'Visibility', icon: 'Target', home: true },
  'social-ads': { category: 'Visibility', icon: 'Megaphone' },
  'social-media': { category: 'Visibility', icon: 'Sparkles' },
  'ui-ux-design': { category: 'Growth', icon: 'Palette', home: true },
  'branding': { category: 'Growth', icon: 'Brush' },
  'maintenance': { category: 'Growth', icon: 'Wrench', home: true },
}

const packageFeatures = {
  silver: [
    'Website with 5 sections', 'Responsive design', 'Domain + hosting for 1 year',
    'Business email setup', 'Google Business Profile setup', '3 designed social media posts',
    'Facebook + Instagram setup', 'WhatsApp button', 'Delivery: 5–7 working days',
  ],
  gold: [
    'Premium landing page up to 8 sections', 'Responsive design + animations', 'Domain + hosting for 1 year',
    '2 custom-domain email mailboxes', 'Google Business Profile optimization', '6 designed social media posts',
    'WhatsApp + contact form', 'Basic SEO + Google Analytics', '15 days bug support', 'Delivery: 7–10 working days',
  ],
  platinum: [
    'Premium website up to 5 pages', 'Custom UI/UX + animations', 'Domain + hosting for 1 year',
    '3 custom-domain email mailboxes', 'Google Business Profile optimization', '12 designed social media posts',
    'WhatsApp + contact form', 'On-page SEO + Search Console', '30 days bug support', 'Delivery: 12–18 working days',
  ],
}

const productData = {
  silver: { name: 'Silver', price: 13500, compare: 15000, category: 'website-package', features: packageFeatures.silver, home: true },
  gold: { name: 'Gold', price: 26991, compare: 29990, category: 'website-package', features: packageFeatures.gold, home: true },
  platinum: { name: 'Platinum', price: 41391, compare: 45990, category: 'website-package', features: packageFeatures.platinum, home: true },
  'maintenance-silver': { name: 'Maintenance — Silver', price: 1500, compare: null, category: 'maintenance', features: ['Essential updates and security patches'], home: false },
  'maintenance-gold': { name: 'Maintenance — Gold', price: 2500, compare: null, category: 'maintenance', features: ['Updates, content changes, and priority support'], home: false },
  'maintenance-platinum': { name: 'Maintenance — Platinum', price: 5000, compare: null, category: 'maintenance', features: ['Full care including content, SEO tweaks, and reporting'], home: false },
}

const client = await pool.connect()
try {
  // --- services ---
  for (const [slug, d] of Object.entries(serviceData)) {
    const title = (await client.query('select title from services where slug=$1', [slug])).rows[0]?.title ?? slug
    await client.query(
      `update services set category=$2, icon=$3, cta_label='Learn more',
         whatsapp_message=$4, show_on_homepage=$5, updated_at=now() where slug=$1`,
      [slug, d.category, d.icon, `Hi! I'm interested in ${title}. Could you share details?`, d.home ?? false],
    )
  }
  console.log('services updated:', Object.keys(serviceData).length)

  // --- products ---
  for (const [slug, d] of Object.entries(productData)) {
    await client.query(
      `update products set name=$2, price=$3, compare_price=$4, currency='PKR',
         features=$5::jsonb, category=$6, cta_label='Get started',
         whatsapp_message=$7, show_on_homepage=$8, status='active', updated_at=now()
       where slug=$1`,
      [slug, d.name, d.price, d.compare, JSON.stringify(d.features), d.category,
       `Hi! I'd like to ask about the ${d.name} package.`, d.home],
    )
  }
  console.log('products updated:', Object.keys(productData).length)

  // --- flip catalog sections to live source ---
  const svcSections = await client.query(
    `select s.id, s.sort_order from sections s join pages p on p.id=s.page_id
     where p.slug='services' and s.section_type='services' order by s.sort_order`,
  )
  const svcCategories = ['Web', 'Visibility', 'Growth']
  for (const row of svcSections.rows) {
    const cat = svcCategories[row.sort_order - 1] ?? ''
    await client.query(
      `update sections set content = content || $2::jsonb, updated_at=now() where id=$1`,
      [row.id, JSON.stringify({ source: 'database', category: cat })],
    )
  }
  console.log('service sections -> live:', svcSections.rows.length)

  const priceSections = await client.query(
    `select s.id, s.sort_order from sections s join pages p on p.id=s.page_id
     where p.slug='pricing' and s.section_type='pricing' order by s.sort_order`,
  )
  const priceCategories = ['website-package', 'maintenance']
  for (const row of priceSections.rows) {
    const cat = priceCategories[row.sort_order - 1] ?? ''
    await client.query(
      `update sections set content = content || $2::jsonb, updated_at=now() where id=$1`,
      [row.id, JSON.stringify({ source: 'database', category: cat })],
    )
  }
  console.log('pricing sections -> live:', priceSections.rows.length)
} finally {
  client.release()
  await pool.end()
}
