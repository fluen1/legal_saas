-- Add pipeline_metrics JSONB column to health_checks for storing
-- timing, token usage, retries, and tool rounds per pipeline step.
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS pipeline_metrics jsonb;
