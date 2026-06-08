-- Business Health Reporter - Phase 3 schema
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('excel', 'csv', 'google-sheets')),
  file_name text,
  status text not null default 'uploaded',
  row_count integer not null default 0,
  mapped_required_fields integer not null default 0,
  completion_rate integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.upload_rows (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  row_number integer not null,
  product_name text not null,
  category text not null,
  supplier_name text not null,
  selling_location text not null,
  unit_cost numeric,
  selling_price numeric,
  units_sold integer,
  stock_units integer,
  created_at timestamptz not null default now()
);

create table if not exists public.validation_issues (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  row_number integer,
  field_key text,
  severity text not null check (severity in ('error', 'warning')),
  code text not null,
  message text not null,
  recommendation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_scores (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  product_name text not null,
  category text not null,
  supplier_name text not null,
  location text not null,
  unit_cost numeric not null,
  selling_price numeric not null,
  units_sold integer not null,
  stock_units integer not null,
  margin_percent numeric not null,
  revenue numeric not null,
  profit numeric not null,
  score numeric not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_scores (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  supplier_name text not null,
  products_supplied integer not null,
  average_unit_cost numeric not null,
  average_margin_percent numeric not null,
  lead_time_days integer not null,
  reliability_rate numeric not null,
  score numeric not null,
  impact text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.category_scores (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  category text not null,
  revenue numeric not null,
  margin_percent numeric not null,
  health_score numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_reports (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  health_score integer not null,
  previous_health_score integer not null,
  delta integer not null,
  average_margin_percent numeric not null,
  data_quality_score integer not null,
  improving_factors jsonb not null default '[]'::jsonb,
  harming_factors jsonb not null default '[]'::jsonb,
  increase_actions jsonb not null default '[]'::jsonb,
  avoid_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_upload_rows_upload_id on public.upload_rows(upload_id);
create index if not exists idx_validation_issues_upload_id on public.validation_issues(upload_id);
create index if not exists idx_product_scores_upload_id on public.product_scores(upload_id);
create index if not exists idx_supplier_scores_upload_id on public.supplier_scores(upload_id);
create index if not exists idx_category_scores_upload_id on public.category_scores(upload_id);
create index if not exists idx_business_reports_upload_id on public.business_reports(upload_id);

-- Optional: keep RLS disabled for MVP internal demo with service role writes.
alter table public.uploads disable row level security;
alter table public.upload_rows disable row level security;
alter table public.validation_issues disable row level security;
alter table public.product_scores disable row level security;
alter table public.supplier_scores disable row level security;
alter table public.category_scores disable row level security;
alter table public.business_reports disable row level security;

-- Phase 4 Auth & Billing Schema
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  plan_status text default 'free',
  plan_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles disable row level security;
