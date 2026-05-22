-- Run in Supabase SQL Editor (Dashboard → SQL) after linking the project.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  created_at timestamptz not null default now()
);

create unique index if not exists contact_submissions_email_key
  on public.contact_submissions (email);

alter table public.contact_submissions enable row level security;

-- No policies: only the service role (server API) can read/write.
