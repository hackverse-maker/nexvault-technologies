# NexVault Technologies — Deployment Guide

## 1. Environment variables

Set these in the hosting provider (Vercel → Project → Settings → Environment Variables). Never commit `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string (`…-pooler…neon.tech/neondb?sslmode=require`) |
| `BLOB_READ_WRITE_TOKEN` | Yes (uploads) | Vercel Blob read/write token — create a Blob store in Vercel and link it to the project |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL, e.g. `https://www.nexvaulttechnologies.com` — used for canonical links, OG tags, sitemap, robots |
| `ADMIN_EMAIL` | First deploy only | Bootstrap admin email (used by `scripts/create-admin.mjs`) |
| `ADMIN_PASSWORD` | First deploy only | Bootstrap admin password — use a strong unique value, then rotate |
| `ADMIN_NAME` | Optional | Display name for the bootstrap admin |

`NEXT_PUBLIC_BUSINESS_EMAIL`, `NEXT_PUBLIC_BUSINESS_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_OFFICE_LOCATION` exist in `.env.example` for optional overrides of the contact fallbacks in `lib/contact.ts`.

## 2. Database migrations

Migrations are plain SQL in `drizzle/` and must be applied in order:

```
0000–0003  initial CMS schema (tables: user/session/admin, pages, sections, services, products, inquiries, settings, nav, etc.)
0004       media library, assignments, hero slides, sliders
0005       catalog fields (category, icon, CTA, WhatsApp message, homepage flags, product features/compare price)
0006       whatsapp_settings + whatsapp_numbers
0007       contact_inquiries.subject
0008       pages.og_image
```

Apply with the helper (uses `DATABASE_URL`):

```
node scripts/apply-migration.mjs drizzle/0008_page_og_image.sql   # repeat per file, in order
```

Or paste each file into the Neon SQL editor / `psql $DATABASE_URL -f drizzle/XXXX.sql`.

## 3. First admin account

```
pnpm install
node scripts/create-admin.mjs    # reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from env
```

Sign in at `/admin/login`. Rate limiting (5 attempts / 15 min) is enforced.

## 4. Seed content (optional — fresh DB only)

```
node scripts/seed-media.mjs      # Unsplash imagery → media_library (requires BLOB token for hosting? registers external URLs)
node scripts/seed-pages.mjs      # pages, sections, services, products
node scripts/seed-navigation.mjs # header nav + footer columns
node scripts/seed-step11.mjs     # catalog fields + live-source sections
```

Check state with `node scripts/check-cms-tables.mjs`.

## 5. Image storage

- Vercel Blob is the store. Set `BLOB_READ_WRITE_TOKEN`, then uploads from `/admin/media` work end-to-end (browser → Blob → DB registration).
- `/api/img/[id]?w=` resizes via Sharp and caches aggressively; GIFs pass through animated.
- Without the token, uploads return an error but external-URL registration still works.

## 6. Deploy (Vercel)

1. Import the GitHub repo in Vercel (framework: Next.js, build `pnpm build`, install `pnpm install`).
2. Add the env vars above for Production **and** Preview.
3. Deploy. Vercel runs `pnpm build` — verified exit 0.
4. Apply migrations against the production `DATABASE_URL`, create the admin, seed if needed.
5. Verify: `/`, `/services`, `/pricing`, `/contact`, `/admin/login`, `/sitemap.xml`, `/robots.txt`.

## 7. Backups

- Neon: enable point-in-time restore / scheduled snapshots in the Neon console (free tier keeps ~24h history; paid keeps longer).
- Vercel Blob: objects are durable; for extra safety periodically mirror `media_library.public_url` listings.
- Before risky admin bulk edits, export tables via `pg_dump "$DATABASE_URL" > backup.sql`.

## 8. Post-deploy checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set → canonical/OG/sitemap show the real domain
- [ ] WhatsApp number correct under Business Information (`+92 314 8951060`)
- [ ] Hero slides + sliders have visible images in Media Library
- [ ] At least one service/product flagged "Show on homepage"
- [ ] Contact form submits and appears under Inquiries
