create table if not exists public.todos (
  id text primary key,
  title text not null,
  description text not null default '',
  items jsonb not null default '[]'::jsonb,
  visibility text not null default 'private' check (visibility in ('public', 'private', 'shared')),
  shared_with text[] not null default '{}'::text[],
  owner_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table public.todos
add column if not exists share_slug text;

alter table public.todos enable row level security;

drop policy if exists "todos_select_public" on public.todos;
create policy "todos_select_public"
on public.todos
for select
to anon
using (visibility in ('public', 'shared') and share_slug is not null);

drop policy if exists "todos_select_own" on public.todos;
create policy "todos_select_own"
on public.todos
for select
to authenticated
using (owner_id = (select auth.uid())::text);

drop policy if exists "todos_insert_own" on public.todos;
create policy "todos_insert_own"
on public.todos
for insert
to authenticated
with check (owner_id = (select auth.uid())::text);

drop policy if exists "todos_update_own" on public.todos;
create policy "todos_update_own"
on public.todos
for update
to authenticated
using (owner_id = (select auth.uid())::text)
with check (owner_id = (select auth.uid())::text);

drop policy if exists "todos_delete_own" on public.todos;
create policy "todos_delete_own"
on public.todos
for delete
to authenticated
using (owner_id = (select auth.uid())::text);

create index if not exists todos_owner_id_idx on public.todos (owner_id);
create index if not exists todos_share_slug_idx on public.todos (share_slug);
create unique index if not exists todos_share_slug_unique_idx on public.todos (share_slug);
create index if not exists todos_deleted_at_idx on public.todos (deleted_at);
create index if not exists todos_updated_at_idx on public.todos (updated_at desc);