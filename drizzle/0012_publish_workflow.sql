ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_snapshot jsonb;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS draft_saved_at timestamptz;

CREATE TABLE IF NOT EXISTS page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  snapshot jsonb NOT NULL,
  note text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_number)
);
CREATE INDEX IF NOT EXISTS page_versions_page_id_idx ON page_versions (page_id);

-- Backfill: snapshot current live sections as the published version for published pages.
UPDATE pages p SET
  published_snapshot = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'sectionType', s.section_type,
        'content', s.content,
        'sortOrder', s.sort_order,
        'isVisible', s.is_visible
      ) ORDER BY s.sort_order
    )
    FROM sections s WHERE s.page_id = p.id
  ),
  published_at = COALESCE(p.published_at, p.updated_at),
  draft_saved_at = p.updated_at
WHERE p.status = 'published';
