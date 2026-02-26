-- Email preferences table for unsubscribe support
create table if not exists email_preferences (
  email text primary key,
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick lookups during email sending
create index if not exists idx_email_preferences_unsubscribed
  on email_preferences (email) where unsubscribed = true;