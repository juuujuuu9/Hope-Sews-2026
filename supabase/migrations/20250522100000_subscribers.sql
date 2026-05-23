-- Subscribers from the landing page email signup.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  created_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_key
  on public.subscribers (email);

alter table public.subscribers enable row level security;

-- Migrate legacy table name if present.
do $$
begin
  if exists (
    select from pg_tables
    where schemaname = 'public' and tablename = 'contact_submissions'
  ) then
    insert into public.subscribers (id, email, created_at)
    select id, email, created_at
    from public.contact_submissions
    on conflict (email) do nothing;

    drop table public.contact_submissions;
  end if;
end $$;
