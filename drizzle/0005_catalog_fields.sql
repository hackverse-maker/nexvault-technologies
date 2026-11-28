-- Step 11: catalog fields for services and products
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS compare_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;
