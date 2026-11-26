CREATE TABLE IF NOT EXISTS public."user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session (
  id text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON public.session("userId");

CREATE TABLE IF NOT EXISTS public.account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_id_idx ON public.account("userId");

CREATE TABLE IF NOT EXISTS public.verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON public.verification(identifier);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE REFERENCES public."user"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_provider text NOT NULL DEFAULT 'vercel_blob',
  object_key text NOT NULL UNIQUE,
  public_url text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  byte_size integer NOT NULL CHECK (byte_size > 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  alt_text text NOT NULL DEFAULT '',
  uploaded_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  default_seo_title text NOT NULL DEFAULT '',
  default_seo_description text NOT NULL DEFAULT '',
  logo_media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_information (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  primary_phone text NOT NULL,
  secondary_phone text NOT NULL,
  whatsapp_number text NOT NULL,
  business_email text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_media_links_sort_order_idx ON public.social_media_links(sort_order);

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pages_status_idx ON public.pages(status);

CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sections_page_sort_order_uidx UNIQUE (page_id, sort_order)
);
CREATE INDEX IF NOT EXISTS sections_page_id_idx ON public.sections(page_id);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  location text NOT NULL DEFAULT 'header' CHECK (location IN ('header', 'footer')),
  target_page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  target_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT navigation_items_target_check CHECK ((target_page_id IS NOT NULL) <> (target_url IS NOT NULL)),
  CONSTRAINT navigation_items_location_sort_uidx UNIQUE (location, sort_order)
);

CREATE TABLE IF NOT EXISTS public.footer_configuration (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  copyright_text text NOT NULL DEFAULT '',
  show_social_links boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'PKR',
  media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_status_sort_idx ON public.products(status, sort_order);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS services_active_sort_idx ON public.services(is_active, sort_order);

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  business_name text,
  phone text,
  message text NOT NULL,
  requested_package text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'replied', 'archived')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_inquiries_status_created_idx ON public.contact_inquiries(status, created_at);
CREATE INDEX IF NOT EXISTS contact_inquiries_email_idx ON public.contact_inquiries(email);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_logs_admin_created_idx ON public.activity_logs(admin_user_id, created_at);
CREATE INDEX IF NOT EXISTS activity_logs_entity_idx ON public.activity_logs(entity_type, entity_id);

INSERT INTO public.website_settings (id, company_name, tagline, default_seo_title, default_seo_description)
VALUES (1, 'NexVault Technologies', 'Build. Rank. Grow.', 'NexVault Technologies | Build. Rank. Grow.', 'NexVault Technologies builds premium websites, digital brands, and growth systems for ambitious businesses.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contact_information (id, primary_phone, secondary_phone, whatsapp_number, business_email)
VALUES (1, '+92 334 5013684', '+92 314 8951060', '+92 314 8951060', 'nexvault.technology@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.social_media_links (platform, label, url, sort_order)
VALUES
  ('instagram', '@nexvault_technologies', 'https://instagram.com/nexvault_technologies?mdxt=MW45MTA1eGdqbTBtcg==', 1),
  ('facebook', 'Facebook', 'https://www.facebook.com/share/1Z2Rwz4ArQ/', 2)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO public.footer_configuration (id, heading, description, copyright_text, show_social_links)
VALUES (1, 'Build. Rank. Grow.', 'Independent digital strategy, design, and engineering for ambitious businesses.', '© 2026 NexVault Technologies. All Rights Reserved.', true)
ON CONFLICT (id) DO NOTHING;
