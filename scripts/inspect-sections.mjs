import { config } from 'dotenv'
config({ path: '.env.local' })
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query(
  `select p.slug as page, s.id, s.section_type, s.sort_order,
          s.content->>'title' as title, s.content->>'source' as src,
          s.content->>'category' as cat,
          jsonb_array_length(coalesce(s.content->'items','[]'::jsonb)) as items
   from sections s join pages p on p.id = s.page_id
   where p.slug in ('services','pricing','get-a-quote','contact')
   order by p.slug, s.sort_order`,
)
console.log(JSON.stringify(rows, null, 1))
await pool.end()
