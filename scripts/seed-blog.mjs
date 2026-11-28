// Seeds the blog_posts table with the existing bundled articles.
// Run: node scripts/seed-blog.mjs
import nextEnv from '@next/env'
import pg from 'pg'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })

const POSTS = [
  {
    slug: 'website-that-works-harder',
    title: 'What makes a website work harder for your business?',
    excerpt: 'A practical look at the decisions that turn a digital presence into a real business asset.',
    category: 'Web Development',
    date: '2026-05-14',
    read: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    content: [
      {
        heading: 'Start with the job, not the design',
        paragraphs: [
          'Most websites underperform for the same reason: they were designed to look impressive rather than to do a specific job. Before touching layout or color, decide what the site needs to accomplish — capture a lead, sell a product, book a call, or build trust before a first meeting.',
          'Once the job is clear, every section earns its place. A hero that doesn’t tell visitors what you do and why it matters is wasted space. A contact form buried three clicks deep is a conversion killer. Clarity beats cleverness almost every time.',
        ],
      },
      {
        heading: 'Speed and structure are features, not afterthoughts',
        paragraphs: [
          'A beautiful site that takes eight seconds to load will lose visitors before they see it. Performance is part of the product: lean images, sensible caching, minimal third-party scripts, and a hosting setup that doesn’t fall over at the worst moment.',
          'Structure matters just as much. Clear headings, logical page hierarchy, descriptive links, and alt text aren’t just accessibility checkboxes — they help both visitors and search engines understand what matters on each page.',
        ],
      },
      {
        heading: 'Measure what actually matters',
        paragraphs: [
          'Vanity metrics like pageviews tell you almost nothing on their own. Track the actions that connect to revenue: form submissions, calls, purchases, time-to-contact. If you can’t see what’s working, you can’t improve it — and every redesign becomes a guess.',
        ],
      },
    ],
  },
  {
    slug: 'local-search-foundations',
    title: 'The local search foundations worth getting right',
    excerpt: 'Clarity, consistency, and useful information still win the local search game.',
    category: 'Google Business Profile',
    date: '2026-04-28',
    read: '5 min read',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1200&auto=format&fit=crop',
    content: [
      {
        heading: 'Consistency beats cleverness',
        paragraphs: [
          'Local search rewards boring consistency. Your business name, address, phone number, hours, and categories should be identical everywhere they appear — your website, Google Business Profile, directories, and social profiles. Small inconsistencies quietly erode trust with both customers and search engines.',
        ],
      },
      {
        heading: 'Your profile is a landing page',
        paragraphs: [
          'Treat your Google Business Profile like a storefront, not a formality. Complete every field, choose the most specific categories available, post updates regularly, and keep photos current. An active, complete profile signals a business that is open, attentive, and real.',
        ],
      },
      {
        heading: 'Reviews are a compounding asset',
        paragraphs: [
          'Reviews are one of the few ranking and trust signals you can actively influence. Ask every satisfied customer — at the right moment, through the right channel — and respond to every review, good or bad. A thoughtful reply to a negative review often convinces more people than the review itself.',
        ],
      },
    ],
  },
  {
    slug: 'digital-presence-reset',
    title: 'A better way to reset your digital presence',
    excerpt: 'Before adding more channels, make the ones you have work together.',
    category: 'Business Growth',
    date: '2026-04-10',
    read: '7 min read',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop',
    content: [
      {
        heading: 'Audit before you add',
        paragraphs: [
          'The instinct when growth stalls is to add another channel: a new ad platform, another social network, a second website. Before doing that, audit what you already have. Most businesses have assets that are underperforming because of fixable problems — slow pages, unclear messaging, a profile that contradicts the website.',
        ],
      },
      {
        heading: 'One story, told consistently',
        paragraphs: [
          'Your website, social profiles, ads, and listings should all tell the same story: who you help, what problem you solve, and why you’re the credible choice. When channels contradict each other — different names, different promises, different quality bars — every touchpoint works a little less hard than it could.',
        ],
      },
      {
        heading: 'Fix the foundation, then scale',
        paragraphs: [
          'Paid traffic and aggressive posting amplify whatever is already there — including weaknesses. If your site doesn’t convert visitors into enquiries, more visitors just means more wasted spend. Get the foundation right first, then scale the channels that are working.',
        ],
      },
    ],
  },
]

for (const post of POSTS) {
  await pool.query(
    `INSERT INTO blog_posts (slug, title, excerpt, category, image, content, read_time, status, published_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,'published',$8)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, category = EXCLUDED.category,
       image = EXCLUDED.image, content = EXCLUDED.content, read_time = EXCLUDED.read_time,
       status = 'published', published_at = EXCLUDED.published_at, updated_at = now()`,
    [post.slug, post.title, post.excerpt, post.category, post.image, JSON.stringify(post.content), post.read, post.date],
  )
  console.log(`seeded post: ${post.slug}`)
}

await pool.end()
console.log('Done.')
