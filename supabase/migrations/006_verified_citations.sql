-- Verified citations cache for retsinformation.dk API responses
create table if not exists verified_citations (
  id uuid primary key default gen_random_uuid(),
  law_id text not null,
  paragraph text not null,
  stk text,
  verified boolean not null,
  api_response jsonb,
  retsinformation_url text,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),

  constraint verified_citations_unique unique (law_id, paragraph, stk)
);

-- Index for fast lookups
create index if not exists idx_verified_citations_lookup
  on verified_citations (law_id, paragraph, stk);

-- RLS: service-role only
alter table verified_citations enable row level security;
-- No RLS policies = only service-role key can access
