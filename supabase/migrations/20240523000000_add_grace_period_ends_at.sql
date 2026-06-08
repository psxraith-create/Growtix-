-- Add grace_period_ends_at to profiles table
alter table public.profiles add column if not exists grace_period_ends_at timestamptz;
