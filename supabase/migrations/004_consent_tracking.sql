-- Add consent timestamp tracking for GDPR compliance
ALTER TABLE health_checks
ADD COLUMN IF NOT EXISTS consented_at timestamptz;

ALTER TABLE lead_magnets
ADD COLUMN IF NOT EXISTS consented_at timestamptz;
