-- Cut Tracker storage. Run once in Supabase: SQL Editor > New query > paste > Run.
-- One row per saved document (a day's food, a lift session, a weigh-in, a prep week, settings).
-- Row-level security means each signed-in person can only read and write their own rows.

create table if not exists public.docs (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.docs enable row level security;

drop policy if exists "read own docs"   on public.docs;
drop policy if exists "insert own docs" on public.docs;
drop policy if exists "update own docs" on public.docs;
drop policy if exists "delete own docs" on public.docs;

create policy "read own docs"   on public.docs for select using (auth.uid() = user_id);
create policy "insert own docs" on public.docs for insert with check (auth.uid() = user_id);
create policy "update own docs" on public.docs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own docs" on public.docs for delete using (auth.uid() = user_id);
