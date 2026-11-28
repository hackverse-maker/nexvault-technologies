ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS subject text;
CREATE INDEX IF NOT EXISTS contact_inquiries_subject_idx ON contact_inquiries (subject);
