-- Add analysis progress tracking for multi-agent pipeline
ALTER TABLE public.health_checks ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'pending';
ALTER TABLE public.health_checks ADD COLUMN IF NOT EXISTS analysis_step text;

COMMENT ON COLUMN public.health_checks.analysis_status IS 'pending|profiling|analyzing|orchestrating|verifying|complete|error';
COMMENT ON COLUMN public.health_checks.analysis_step IS 'Human-readable step description for progress UI';
