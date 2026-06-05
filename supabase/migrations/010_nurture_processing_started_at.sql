-- Add processing_started_at to detect stuck rows
ALTER TABLE nurture_emails
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz;
