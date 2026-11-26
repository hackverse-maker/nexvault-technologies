-- Step 10: Advanced media library
-- Extends media_library with organization metadata and adds assignment,
-- hero banner, and slider tables.

ALTER TABLE public.media_library
  ADD COLUMN IF NOT EXISTS caption text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS folder text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS media_library_folder_idx ON public.media_library(folder);

CREATE TABLE IF NOT EXISTS public.media_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('page', 'section', 'product', 'service', 'header', 'footer', 'website')),
  target_id text,
  role text NOT NULL DEFAULT 'image',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_assignments_media_idx ON public.media_assignments(media_id);
CREATE INDEX IF NOT EXISTS media_assignments_target_idx ON public.media_assignments(target_type, target_id);

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_slides_sort_idx ON public.hero_slides(sort_order);

CREATE TABLE IF NOT EXISTS public.sliders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sliders_page_idx ON public.sliders(page_id);

CREATE TABLE IF NOT EXISTS public.slider_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slider_id uuid NOT NULL REFERENCES public.sliders(id) ON DELETE CASCADE,
  media_id uuid REFERENCES public.media_library(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS slider_slides_slider_idx ON public.slider_slides(slider_id, sort_order);
