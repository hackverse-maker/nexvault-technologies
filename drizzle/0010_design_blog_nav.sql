CREATE TABLE IF NOT EXISTS design_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT design_settings_singleton_check CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Journal',
  image text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_time text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_status_check CHECK (status IN ('draft','published'))
);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status, published_at);

ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES navigation_items(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS navigation_items_parent_idx ON navigation_items (parent_id);
