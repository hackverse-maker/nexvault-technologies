// Seeds the CMS: pages + sections (all marketing pages), services catalog,
// and products (packages + maintenance plans).
// Idempotent — upserts by slug, replaces sections per page.
// Run: node scripts/seed-pages.mjs
import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })

// ---------- shared content (mirrors lib/site-data.ts / lib/packages.ts) ----------

const SERVICES = [
  { slug: 'web-development', title: 'Web Design & Development', description: 'High-performance websites engineered to make your first impression count.', features: ['Responsive, accessible interfaces', 'Modern Next.js engineering', 'Conversion-focused UX', 'Performance and SEO foundations'] },
  { slug: 'ecommerce', title: 'E-commerce Development', description: 'Digital storefronts that make buying simple, memorable, and scalable.', features: ['Product and catalog experiences', 'Secure checkout journeys', 'Conversion-ready design', 'Analytics and growth setup'] },
  { slug: 'google-business-profile', title: 'Google Business Profile', description: 'Get discovered locally with a profile that builds trust before the first call.', features: ['Profile setup and guidance', 'Maps listing assistance', 'Business information management', 'Photo and service updates'] },
  { slug: 'local-seo', title: 'Google Maps Optimization', description: 'Make your local presence clearer, stronger, and easier to find.', features: ['Local SEO improvements', 'Listing optimization', 'Review response guidance', 'Location-focused content'] },
  { slug: 'seo', title: 'Search Engine Optimization', description: 'A durable search strategy built around relevance, clarity, and momentum.', features: ['Technical SEO audits', 'Content strategy', 'On-page optimization', 'Search performance reporting'] },
  { slug: 'google-ads', title: 'Google Ads Management', description: 'Focused campaigns that turn intent into measurable opportunities.', features: ['Search and display campaigns', 'Audience and keyword targeting', 'Conversion tracking', 'Performance reporting'] },
  { slug: 'social-ads', title: 'Facebook & Instagram Ads', description: 'Scroll-stopping creative and thoughtful targeting for modern brands.', features: ['Campaign setup', 'Creative direction', 'Audience targeting', 'Testing and optimization'] },
  { slug: 'social-media', title: 'Social Media Management', description: 'A consistent, considered social presence that sounds like your brand.', features: ['Content calendars', 'Creative production', 'Community guidance', 'Monthly insights'] },
  { slug: 'ui-ux-design', title: 'UI/UX Design', description: 'Clear, intuitive product experiences that feel effortless to use.', features: ['User flows and wireframes', 'Interface systems', 'Prototyping', 'Design handoff'] },
  { slug: 'branding', title: 'Branding & Logo Design', description: 'Distinctive visual systems built to be remembered and repeated.', features: ['Logo systems', 'Visual direction', 'Brand guidelines', 'Campaign-ready assets'] },
  { slug: 'maintenance', title: 'Maintenance & Support', description: 'Reliable technical partnership for everything that happens after launch.', features: ['Security and updates', 'Content changes', 'Technical support', 'Ongoing improvements'] },
]

const PROJECTS = [
  { slug: 'northstar-studio', title: 'Northstar Studio', category: 'Business Websites', description: 'A confident digital home for an architecture practice with a point of view.', media: 'modern-office.jpg', tech: ['Next.js', 'Strategy', 'UI/UX'] },
  { slug: 'form-and-function', title: 'Form & Function', category: 'E-commerce', description: 'A considered shopping experience for a modern furniture label.', media: 'design-workspace.jpg', tech: ['E-commerce', 'Art Direction', 'SEO'] },
  { slug: 'local-foundry', title: 'Local Foundry', category: 'Digital Campaigns', description: 'A local growth system designed to connect a neighborhood brand with its next customers.', media: 'analytics-dashboard.jpg', tech: ['Local SEO', 'Google Ads', 'Content'] },
  { slug: 'meridian-row', title: 'Meridian Row', category: 'Business Websites', description: 'A refined corporate presence for a property group, built around clarity and credibility.', media: 'architecture-white.jpg', tech: ['Next.js', 'Responsive Design', 'SEO'] },
  { slug: 'copper-and-clay', title: 'Copper & Clay', category: 'E-commerce', description: 'A warm, product-first storefront concept for a homewares brand.', media: 'furniture-store.jpg', tech: ['E-commerce', 'UI/UX', 'Conversion Design'] },
  { slug: 'fieldnote-studio', title: 'Fieldnote Studio', category: 'UI/UX Design', description: 'A calm, editorial interface system for a research and notes product.', media: 'design-interior.jpg', tech: ['UI/UX', 'Design System', 'Prototyping'] },
  { slug: 'juniper-and-co', title: 'Juniper & Co', category: 'Branding', description: 'A minimal identity direction for a boutique wellness label.', media: 'minimal-chair.jpg', tech: ['Branding', 'Logo Design', 'Art Direction'] },
]

const PRINCIPLES = [
  { title: 'Built around your business', text: 'No cookie-cutter packages. We connect strategy, design, and technology to the way you actually work.' },
  { title: 'Designed for momentum', text: 'Every touchpoint has a job: earn attention, build trust, or make the next step easier.' },
  { title: 'A partner after launch', text: 'We stay close to the details so your digital presence keeps getting better.' },
]

const PROCESS_STEPS = ['Discover', 'Plan', 'Design', 'Develop', 'Launch', 'Grow']

const FAQ_ITEMS = [
  { q: 'How do projects begin?', a: 'We start with a focused conversation about your goals, audience, and current challenges. From there, we recommend the clearest next step.' },
  { q: 'Do you work with international clients?', a: 'Yes. Nexvault is built to work with ambitious businesses across time zones and markets.' },
  { q: 'Do you guarantee rankings or advertising results?', a: 'No. We build disciplined strategies, measure the right signals, and improve over time without making guarantees we cannot responsibly make.' },
]

const ABOUT_VALUES = ['Clarity over complexity', 'Craft over shortcuts', 'Partnership over handoff']

const PACKAGES = [
  { slug: 'silver', name: 'Silver', label: 'Starter Business Package', old: 'Rs. 15,000', price: 'Rs. 13,500', advance: 'Rs. 4,050', features: ['Website with 5 sections', 'Responsive design', 'Domain + hosting for 1 year', 'Business email setup', 'Google Business Profile setup', '3 designed social media posts', 'Facebook + Instagram setup', 'WhatsApp button', 'Delivery: 5–7 working days'] },
  { slug: 'gold', name: 'Gold', label: 'Professional Business Package', old: 'Rs. 29,990', price: 'Rs. 26,991', advance: 'Rs. 8,097.30', features: ['Premium landing page up to 8 sections', 'Responsive design + animations', 'Domain + hosting for 1 year', '2 custom-domain email mailboxes', 'Google Business Profile optimization', '6 designed social media posts', 'WhatsApp + contact form', 'Basic SEO + Google Analytics', '15 days bug support', 'Delivery: 7–10 working days'] },
  { slug: 'platinum', name: 'Platinum', label: 'Complete Digital Business Package', old: 'Rs. 45,990', price: 'Rs. 41,391', advance: 'Rs. 12,417.30', features: ['Premium website up to 5 pages', 'Custom UI/UX + animations', 'Domain + hosting for 1 year', '3 custom-domain email mailboxes', 'Google Business Profile optimization', '12 designed social media posts', 'WhatsApp + contact form', 'On-page SEO + Search Console', '30 days bug support', 'Delivery: 12–18 working days'] },
]

const MAINTENANCE_PLANS = [
  { slug: 'maintenance-silver', name: 'Maintenance — Silver', price: 'Rs. 1,500', note: 'Essential updates and security patches' },
  { slug: 'maintenance-gold', name: 'Maintenance — Gold', price: 'Rs. 2,500', note: 'Updates, content changes, and priority support' },
  { slug: 'maintenance-platinum', name: 'Maintenance — Platinum', price: 'Rs. 5,000', note: 'Full care including content, SEO tweaks, and reporting' },
]

const PRICING_FAQ = [
  { q: 'Do packages include ongoing marketing?', a: 'Packages cover the website and setup. SEO, ads, and social management are scoped separately so you only pay for what you need.' },
  { q: 'Can I change or upgrade later?', a: 'Yes. Many clients start on Silver and move up as the business grows. We plan for that from day one.' },
  { q: 'Do you guarantee rankings or leads?', a: 'No. Digital performance depends on many factors outside our control. We build disciplined strategies and measure the right signals — we don’t promise outcomes we can’t responsibly guarantee.' },
  { q: 'What does the process look like?', a: `Every project follows the same visible path: ${PROCESS_STEPS.join(' → ')}. You always know what stage we’re in.` },
]

const QUOTE_STEPS = [
  { title: 'You share the brief', text: 'Tell us what you are building, improving, or figuring out — goals, audience, timeline, budget range.' },
  { title: 'We review and respond', text: 'We read every submission personally and come back with questions or a clear proposed scope.' },
  { title: 'We shape the plan', text: 'If it is a fit, we outline deliverables, timeline, and pricing in writing before any work begins.' },
  { title: 'We build together', text: 'A visible process keeps you informed at every stage — Discover, Plan, Design, Develop, Launch, Grow.' },
]

const QUOTE_HELP = [
  'What your business does and who it serves',
  'What you want the website or campaign to accomplish',
  'Whether you have an existing site, brand, or content',
  'Your rough timeline and budget comfort zone',
]

const LEGAL_SECTIONS = {
  'privacy-policy': [
    { title: 'Information we collect', text: 'We only collect information you choose to share through our inquiry forms or direct contact channels.' },
    { title: 'How we use it', text: 'Information is used to respond to requests, scope projects, and improve our services. We do not sell personal information.' },
    { title: 'Questions', text: 'For questions about this policy, contact the configured business email.' },
  ],
  terms: [
    { title: 'Using this website', text: 'You may use this website for lawful purposes and should not attempt to interfere with its operation or security.' },
    { title: 'Project engagements', text: 'Specific deliverables, timelines, and fees are agreed in writing before work begins.' },
    { title: 'No guarantees', text: 'Digital performance depends on many factors. We do not guarantee search rankings, approvals, leads, or revenue.' },
  ],
}

const EMAIL = 'nexvault.technology@gmail.com'

// ---------- helpers ----------

const mediaUrlByName = new Map()
async function loadMediaMap() {
  const { rows } = await pool.query('SELECT id, original_name FROM media_library')
  for (const r of rows) mediaUrlByName.set(r.original_name, `/api/img/${r.id}`)
}
const img = (name) => mediaUrlByName.get(name) ?? ''

async function upsertPage(slug, title, seoTitle, seoDescription) {
  const { rows } = await pool.query(
    `INSERT INTO pages (slug, title, status, seo_title, seo_description, published_at)
     VALUES ($1, $2, 'published', $3, $4, now())
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published',
       seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description, updated_at = now()
     RETURNING id`,
    [slug, title, seoTitle, seoDescription],
  )
  return rows[0].id
}

async function replaceSections(pageId, sectionList) {
  await pool.query('DELETE FROM sections WHERE page_id = $1', [pageId])
  for (let i = 0; i < sectionList.length; i++) {
    const s = sectionList[i]
    await pool.query(
      'INSERT INTO sections (page_id, section_type, content, sort_order, is_visible) VALUES ($1, $2, $3::jsonb, $4, true)',
      [pageId, s.type, JSON.stringify(s.content), i],
    )
  }
}

const hero = (eyebrow, title, text, ctaLabel, ctaHref, extra = {}) => ({
  type: 'hero',
  content: { eyebrow, title, text, ctaLabel, ctaHref, background: 'default', layout: 'center', ...extra },
})
const cta = (eyebrow, title, text, ctaLabel = 'Start a conversation', ctaHref = '/get-a-quote') => ({
  type: 'cta',
  content: { eyebrow, title, text, ctaLabel, ctaHref, background: 'gradient', layout: 'center' },
})

// ---------- seed ----------

await loadMediaMap()
console.log(`media images available: ${mediaUrlByName.size}`)

// ===== ABOUT =====
{
  const pageId = await upsertPage('about', 'About', 'About — NexVault Technologies',
    'NexVault Technologies is a small, senior-led digital studio helping businesses show up clearly, get found, and grow with confidence.')
  await replaceSections(pageId, [
    hero('The studio', 'A digital partner, not a vendor.',
      'Nexvault helps businesses turn scattered digital activity into a clear, credible growth system.',
      'Start a conversation', '/get-a-quote', { bgImage: img('office-meeting.jpg') }),
    {
      type: 'text',
      content: {
        eyebrow: 'Our story', title: 'Small team. Serious craft.',
        text: 'NexVault started with a simple observation: most businesses don\u2019t need more agencies — they need one partner who understands strategy, design, and engineering as a single system.',
        paragraphs: [
          'We work with founders and teams who care about how their brand shows up online. Instead of selling disconnected services, we connect the dots: a website that earns trust, search visibility that compounds, and campaigns that point back to a clear business goal.',
          'We\u2019re internationally remote by design — which means we can collaborate with ambitious businesses across time zones without the overhead of a large agency.',
        ],
        image: img('team-collaboration.jpg'), layout: 'split', background: 'default',
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'What we believe', title: 'The details matter.',
        text: 'Three working principles guide every project we take on.',
        items: PRINCIPLES, background: 'default',
      },
    },
    {
      type: 'about',
      content: {
        eyebrow: 'How we work', title: 'One team, end to end.',
        text: 'Strategy, design, development, and growth live under one roof. That means fewer handoffs, faster decisions, and a single point of accountability from first call to long-term support.',
        items: ABOUT_VALUES.map((v) => ({ title: v, text: '' })),
        image: img('business-meeting.jpg'), layout: 'split', background: 'default',
      },
    },
    {
      type: 'stats',
      content: {
        eyebrow: 'At a glance', title: 'What working with us looks like.',
        items: [
          { value: String(SERVICES.length), label: 'Services under one roof' },
          { value: String(PROJECTS.length), label: 'Demonstration concepts' },
          { value: '24/7', label: 'Monitoring mindset' },
        ],
        background: 'default',
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Process', title: 'A clear path from idea to impact.',
        text: 'Every engagement follows a visible process so you always know what\u2019s happening and what\u2019s next.',
        items: PROCESS_STEPS.map((s, i) => ({ title: `${String(i + 1).padStart(2, '0')} · ${s}`, text: '' })),
        background: 'default',
      },
    },
    { type: 'faq', content: { eyebrow: 'FAQ', title: 'Questions we hear often.', items: FAQ_ITEMS, background: 'default' } },
    cta('Ready when you are', 'Let\u2019s build something that works.',
      'Tell us about your business and where you want to go. We\u2019ll come back with a clear, honest next step.'),
  ])
  console.log('seeded page: about')
}

// ===== SERVICES =====
{
  const pageId = await upsertPage('services', 'Services', 'Services — NexVault Technologies',
    'Web design, development, SEO, Google Ads, social media, branding, and ongoing support — the full digital stack under one roof.')
  const groups = [
    { eyebrow: 'Web', title: 'Web & build', items: SERVICES.slice(0, 4) },
    { eyebrow: 'Visibility', title: 'Get found', items: SERVICES.slice(4, 8) },
    { eyebrow: 'Growth', title: 'Brand & grow', items: SERVICES.slice(8) },
  ]
  await replaceSections(pageId, [
    hero('What we do', 'Everything your business needs to move forward.',
      'The right mix of strategy, craft, and technology for the next stage of your business.',
      'Get a free quote', '/get-a-quote', { bgImage: img('developers-working.jpg') }),
    ...groups.map((g) => ({
      type: 'services',
      content: {
        eyebrow: g.eyebrow, title: g.title, text: '',
        items: g.items.map((s) => ({
          title: s.title, description: s.description,
          href: `/services/${s.slug}`, features: s.features.slice(0, 3),
        })),
        background: 'default',
      },
    })),
    {
      type: 'features',
      content: {
        eyebrow: 'How we work', title: 'One partner, from first call to long-term growth.',
        text: 'Every service connects to the same goal: a digital presence that earns trust and compounds over time.',
        items: [
          { title: 'Clarity first', text: 'We start by understanding your business, audience, and goals — not by selling a package.' },
          { title: 'Craft in the details', text: 'Design, engineering, and copy are treated as one system, not separate deliverables.' },
          { title: 'Measured momentum', text: 'We track the signals that matter and improve what we learn, without making guarantees we can\u2019t keep.' },
        ],
        background: 'default',
      },
    },
    cta('Not sure where to start?', 'Good digital work should feel clear.',
      'Tell us what you are building or improving and we will recommend the clearest next step — even if it is smaller than you expected.',
      'Talk through your project', '/get-a-quote'),
  ])
  console.log('seeded page: services')
}

// ===== PORTFOLIO =====
{
  const pageId = await upsertPage('portfolio', 'Portfolio', 'Portfolio — NexVault Technologies',
    'A selection of demonstration work showing how NexVault thinks, designs, and builds digital experiences.')
  await replaceSections(pageId, [
    hero('Selected work', 'Digital presence, with a point of view.',
      'A selection of demonstration work showing how we think, design, and build.',
      'Start your project', '/get-a-quote', { bgImage: img('design-flatlay.jpg') }),
    {
      type: 'portfolio',
      content: {
        eyebrow: 'Selected work', title: 'Our work', text: '',
        items: PROJECTS.map((p) => ({
          slug: p.slug, title: p.title, category: p.category, description: p.description,
          image: img(p.media), tech: p.tech, link: '', demo: true,
        })),
        background: 'dark',
      },
    },
    {
      type: 'text',
      content: {
        title: '', text: '',
        paragraphs: ['Demonstration concept — replace with verified client work when available.'],
        background: 'default',
      },
    },
    cta('Your turn', 'Have a project in mind?',
      'Share a little context and we\u2019ll show you what a considered digital presence could look like for your business.'),
  ])
  console.log('seeded page: portfolio')
}

// ===== PRICING =====
{
  const pageId = await upsertPage('pricing', 'Pricing', 'Pricing — NexVault Technologies',
    'Transparent website packages and monthly maintenance plans. Every engagement is scoped around your business, not a rigid template.')
  await replaceSections(pageId, [
    hero('Ways to work together', 'Pricing that respects your ambition.',
      'Every business starts from a different place. We scope the right engagement instead of forcing you into a rigid package.',
      'Get a free quote', '/get-a-quote', { bgImage: img('strategy-planning.jpg') }),
    {
      type: 'pricing',
      content: {
        eyebrow: 'Website packages', title: 'A professional start, without the guesswork.',
        text: 'Choose the level that fits your ambition. Every package is built to get your business online with clarity and confidence.',
        items: PACKAGES.map((p) => ({
          name: p.name, label: p.label, price: p.price,
          features: [`Was ${p.old} · 30% advance: ${p.advance}`, ...p.features],
        })),
        background: 'default',
      },
    },
    {
      type: 'pricing',
      content: {
        eyebrow: 'After launch', title: 'Keep your digital presence sharp.',
        text: 'A website is never really finished. Maintenance plans keep yours secure, updated, and improving. First month free for all packages.',
        items: MAINTENANCE_PLANS.map((p) => ({
          name: p.name, label: 'Monthly care plan', price: `${p.price} / month`, features: [p.note],
        })),
        background: 'default',
      },
    },
    { type: 'faq', content: { eyebrow: 'Straight answers', title: 'What you should know before you buy.', items: PRICING_FAQ, background: 'default' } },
    cta('Not sure which fits?', 'Tell us about your business and we\u2019ll recommend the right scope.',
      'A short conversation is usually enough to know whether a package fits or whether a custom scope makes more sense.',
      'Get a free quote', '/get-a-quote'),
  ])
  console.log('seeded page: pricing')
}

// ===== BLOG =====
{
  const pageId = await upsertPage('blog', 'Blog', 'Blog — NexVault Technologies',
    'Practical notes on web development, local search, and growing a business with a clearer digital presence.')
  await replaceSections(pageId, [
    hero('Journal', 'Notes on building a better digital presence.',
      'Notes on building a better digital presence.', 'Get in touch', '/contact', { layout: 'center', bgImage: img('writing-desk.jpg') }),
    { type: 'blog_grid', content: { eyebrow: 'Journal', title: 'Latest notes', text: '', background: 'default' } },
    cta('Stay in the loop', 'Useful notes, occasionally.',
      'Practical writing on web development, local search, and digital growth — sent when there\u2019s something worth saying.',
      'Subscribe', '/contact'),
    cta('Have a project?', 'Let\u2019s talk about what you\u2019re building.',
      'Whether it\u2019s a new website, a visibility push, or a complete digital reset, we\u2019d love to hear about it.'),
  ])
  console.log('seeded page: blog')
}

// ===== CONTACT =====
{
  const pageId = await upsertPage('contact', 'Contact', 'Contact — NexVault Technologies',
    'Have a project in mind? Reach NexVault Technologies by phone, WhatsApp, email, or social — we respond with a thoughtful next step.')
  await replaceSections(pageId, [
    hero('Start a conversation', 'Tell us what is next.',
      'Have a project in mind? Share a little context and we will come back with a thoughtful next step.',
      'Get a free quote', '/get-a-quote', { layout: 'center', bgImage: img('business-meeting.jpg') }),
    {
      type: 'contact',
      content: {
        eyebrow: 'Reach us', title: 'Multiple ways to say hello.',
        text: 'Pick whatever channel you prefer — we read everything and reply personally. Replies typically within 2 business days.',
        background: 'default',
      },
    },
    {
      type: 'cta',
      content: {
        eyebrow: 'Prefer to browse first?', title: 'Explore our work and services.', text: '',
        ctaLabel: 'View portfolio', ctaHref: '/portfolio', background: 'gradient', layout: 'center',
      },
    },
  ])
  console.log('seeded page: contact')
}

// ===== GET A QUOTE =====
{
  const pageId = await upsertPage('get-a-quote', 'Get a Quote', 'Get a Quote — NexVault Technologies',
    'Tell us about your project and receive a clear, thoughtful quote from NexVault Technologies. No pressure, no generic pitch.')
  await replaceSections(pageId, [
    hero('Project brief', 'Let\u2019s make the next move clear.',
      'Give us the useful details. We will give you a clear path forward. No pressure, no generic pitch. Just a useful first conversation.',
      'Get a free quote', '/contact', { layout: 'center', bgImage: img('team-laptops.jpg') }),
    {
      type: 'about',
      content: {
        eyebrow: 'Before you send', title: 'What helps us help you.',
        text: 'A few details up front means a faster, more accurate response.',
        items: QUOTE_HELP.map((h) => ({ title: h, text: '' })),
        background: 'default',
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'What happens next', title: 'Four simple steps.', text: '',
        items: QUOTE_STEPS, background: 'default',
      },
    },
    {
      type: 'text',
      content: {
        title: '', text: '',
        paragraphs: [
          `Typical budgets we scope: ${['Under $2,500', '$2,500–$5,000', '$5,000–$10,000', '$10,000+'].join(' · ')}`,
          `Timelines: ${['ASAP', '1–2 months', '3–6 months', 'Exploring'].join(' · ')}`,
        ],
        background: 'default',
      },
    },
    {
      type: 'contact',
      content: {
        eyebrow: 'Project brief', title: 'Send your project brief.',
        text: 'Tell us what you are building, improving, or figuring out.',
        defaultPackage: '', background: 'default',
      },
    },
  ])
  console.log('seeded page: get-a-quote')
}

// ===== LEGAL =====
for (const [slug, title, seoDesc, sectionsData, other] of [
  ['privacy-policy', 'Privacy Policy', 'How NexVault Technologies collects, uses, and protects the information you share with us.', LEGAL_SECTIONS['privacy-policy'], 'terms'],
  ['terms', 'Terms & Conditions', 'The terms that govern use of the NexVault Technologies website and the scope of our project engagements.', LEGAL_SECTIONS.terms, 'privacy-policy'],
]) {
  const pageId = await upsertPage(slug, title, `${title} — NexVault Technologies`, seoDesc)
  const secs = sectionsData.map((s, i) => ({
    type: 'text',
    content: {
      title: s.title, text: '',
      paragraphs: [
        s.title === 'Questions'
          ? `${s.text} You can reach us at ${EMAIL}.`
          : s.text,
      ],
      background: 'default',
    },
  }))
  secs.push({
    type: 'text',
    content: {
      title: '', text: '',
      paragraphs: [`See also our ${other === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}.`],
      background: 'default',
    },
  })
  await replaceSections(pageId, [
    hero('Legal', title, 'Last updated: October 2026', 'Back to home', '/', {
      layout: 'center',
      bgImage: img(slug === 'privacy-policy' ? 'code-screen.jpg' : 'code-laptop.jpg'),
    }),
    ...secs,
  ])
  console.log(`seeded page: ${slug}`)
}

// ===== SERVICES TABLE =====
for (let i = 0; i < SERVICES.length; i++) {
  const s = SERVICES[i]
  await pool.query(
    `INSERT INTO services (slug, title, description, features, sort_order, is_active)
     VALUES ($1, $2, $3, $4::jsonb, $5, true)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
       features = EXCLUDED.features, sort_order = EXCLUDED.sort_order, updated_at = now()`,
    [s.slug, s.title, s.description, JSON.stringify(s.features), i],
  )
}
console.log(`seeded services: ${SERVICES.length}`)

// ===== PRODUCTS TABLE =====
for (let i = 0; i < PACKAGES.length; i++) {
  const p = PACKAGES[i]
  const priceNum = parseFloat(p.price.replace(/[^0-9.]/g, ''))
  await pool.query(
    `INSERT INTO products (slug, name, description, price, currency, status, sort_order)
     VALUES ($1, $2, $3, $4, 'PKR', 'active', $5)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
       price = EXCLUDED.price, status = 'active', sort_order = EXCLUDED.sort_order, updated_at = now()`,
    [p.slug, `${p.name} Package`, `${p.label} — ${p.price} (was ${p.old}). 30% advance: ${p.advance}. ${p.features.slice(0, 3).join('; ')}.`, priceNum, i],
  )
}
for (let i = 0; i < MAINTENANCE_PLANS.length; i++) {
  const p = MAINTENANCE_PLANS[i]
  const priceNum = parseFloat(p.price.replace(/[^0-9.]/g, ''))
  await pool.query(
    `INSERT INTO products (slug, name, description, price, currency, status, sort_order)
     VALUES ($1, $2, $3, $4, 'PKR', 'active', $5)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
       price = EXCLUDED.price, status = 'active', sort_order = EXCLUDED.sort_order, updated_at = now()`,
    [p.slug, p.name, `Monthly maintenance plan — ${p.price}/month. ${p.note}. First month free with any package.`, priceNum, PACKAGES.length + i],
  )
}
console.log(`seeded products: ${PACKAGES.length + MAINTENANCE_PLANS.length}`)

// ===== report =====
const counts = await pool.query(`
  SELECT 'pages' t, count(*)::int c FROM pages
  UNION ALL SELECT 'sections', count(*)::int FROM sections
  UNION ALL SELECT 'services', count(*)::int FROM services
  UNION ALL SELECT 'products', count(*)::int FROM products
  UNION ALL SELECT 'media_library', count(*)::int FROM media_library
  UNION ALL SELECT 'hero_slides', count(*)::int FROM hero_slides
  UNION ALL SELECT 'sliders', count(*)::int FROM sliders
  UNION ALL SELECT 'contact_inquiries', count(*)::int FROM contact_inquiries
  UNION ALL SELECT 'navigation_items', count(*)::int FROM navigation_items
  ORDER BY 1`)
console.table ? console.log(counts.rows) : null
await pool.end()
console.log('Done.')
