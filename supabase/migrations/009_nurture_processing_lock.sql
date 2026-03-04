-- Prevent duplicate nurture emails from concurrent cron runs
ALTER TABLE nurture_emails ADD COLUMN IF NOT EXISTS processing BOOLEAN DEFAULT FALSE;

-- Optimized index for cron query (includes processing filter)
DROP INDEX IF EXISTS idx_nurture_next_send;
CREATE INDEX idx_nurture_next_send
  ON nurture_emails (next_send_at)
  WHERE completed = FALSE AND unsubscribed = FALSE AND processing = FALSE;
