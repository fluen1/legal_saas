-- Nurture email tracking
CREATE TABLE IF NOT EXISTS nurture_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_check_id UUID REFERENCES health_checks(id),
  email TEXT NOT NULL,
  sequence_step INTEGER NOT NULL DEFAULT 0,
  -- 0 = welcome (already sent), 1-5 = nurture emails
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cron job queries
CREATE INDEX idx_nurture_next_send ON nurture_emails(next_send_at)
  WHERE completed = FALSE AND unsubscribed = FALSE;

-- Lead magnet downloads
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  resource TEXT NOT NULL,  -- 'gdpr-tjekliste', 'fraflytningsguide', 'ejeraftale-skabelon'
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_magnets_email ON lead_magnets(email);
