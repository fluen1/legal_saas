-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- WAITLIST (pre-launch email capture)
-- ============================================
create table public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  source text,
  created_at timestamptz default now() not null
);

-- ============================================
-- HEALTH CHECKS
-- ============================================
create type health_check_status as enum ('draft', 'processing', 'completed', 'failed');
create type payment_status as enum ('free', 'pending', 'paid');
create type score_level as enum ('red', 'yellow', 'green');

create table public.health_checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  answers jsonb not null default '{}',
  report jsonb,
  overall_score score_level,
  status health_check_status default 'draft' not null,
  payment_status payment_status default 'free' not null,
  tier text default 'free' not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.health_checks enable row level security;

create policy "Users can view own health checks"
  on public.health_checks for select
  using (auth.uid() = user_id OR email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "Anyone can insert health checks"
  on public.health_checks for insert
  with check (true);

-- ============================================
-- INDEXES
-- ============================================
create index idx_health_checks_user on public.health_checks(user_id);
create index idx_health_checks_email on public.health_checks(email);
create index idx_health_checks_status on public.health_checks(status);
create index idx_waitlist_email on public.waitlist(email);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.health_checks
  for each row execute procedure update_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure update_updated_at();
