CREATE TABLE IF NOT EXISTS public.header_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  logo_media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL,
  cta_label text NOT NULL DEFAULT 'Get a free quote',
  cta_href text NOT NULL DEFAULT '/get-a-quote',
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  whatsapp_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.header_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.footer_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.navigation_items
  ADD COLUMN IF NOT EXISTS footer_column_id uuid REFERENCES public.footer_columns(id) ON DELETE SET NULL;

ALTER TABLE public.footer_configuration
  ADD COLUMN IF NOT EXISTS logo_media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL;
