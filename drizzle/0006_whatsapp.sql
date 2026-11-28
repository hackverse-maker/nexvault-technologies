-- Step 12: global WhatsApp integration settings + additional numbers
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id integer PRIMARY KEY DEFAULT 1,
  widget_enabled boolean NOT NULL DEFAULT true,
  default_message text NOT NULL DEFAULT 'Hello! I visited your website and would like to inquire about your services.',
  visibility text NOT NULL DEFAULT 'all',
  hidden_pages text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO whatsapp_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  phone text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
