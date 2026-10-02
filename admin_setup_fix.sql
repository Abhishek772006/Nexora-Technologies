-- NEXORA ADMIN ACCESS FIX
-- Run this in Supabase SQL Editor.

-- 1. Make sure the admin authorization table exists.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Enable RLS.
alter table public.admins enable row level security;
alter table public.contact_messages enable row level security;

-- 3. Allow an authenticated admin to read their own authorization row.
drop policy if exists "Admins can read own admin row" on public.admins;
create policy "Admins can read own admin row"
on public.admins
for select
to authenticated
using (user_id = auth.uid());

-- 4. Allow only authorized admins to read client requests.
drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  )
);

-- 5. Public visitors can submit contact requests.
drop policy if exists "Public can submit contact messages" on public.contact_messages;
create policy "Public can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

-- 6. FIRST run this to find your admin user's UUID:
-- select id, email from auth.users;
--
-- Then copy the UUID belonging to your admin email and run:
-- insert into public.admins (user_id)
-- values ('PASTE-YOUR-REAL-UUID-HERE');
--
-- 7. Verify it was added:
-- select a.user_id, u.email
-- from public.admins a
-- join auth.users u on u.id = a.user_id;
