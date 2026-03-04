-- Add missing columns to nurture_emails for personalized nurture sequences
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS score_level TEXT;
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS issue_count INTEGER DEFAULT 0;
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
