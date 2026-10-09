-- Run once in the Supabase SQL Editor for a new testing project.
-- Existing SQLite records are not imported automatically.
begin;
create table if not exists public.content (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  message text not null check (char_length(message) between 3 and 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 10 and 3000),
  created_at timestamptz not null default now()
);
create table if not exists public.rate_limits (
  key text primary key check (char_length(key) = 64),
  count integer not null,
  expires_at timestamptz not null
);
create index if not exists guestbook_public_latest on public.guestbook (id desc) where approved;
create index if not exists rate_limits_expiry on public.rate_limits (expires_at);
alter table public.content enable row level security;
alter table public.guestbook enable row level security;
alter table public.messages enable row level security;
alter table public.rate_limits enable row level security;
-- All application access goes through the server. No direct browser grants.
revoke all on public.content, public.guestbook, public.messages, public.rate_limits from anon, authenticated;
revoke all on sequence public.guestbook_id_seq, public.messages_id_seq from anon, authenticated;
grant select, insert, update, delete on public.content, public.guestbook, public.messages, public.rate_limits to service_role;
grant usage, select on sequence public.guestbook_id_seq, public.messages_id_seq to service_role;
create or replace function public.consume_rate_limit(p_key text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
  current_time_value timestamptz := clock_timestamp();
begin
  if char_length(p_key) <> 64 or p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid rate limit arguments';
  end if;
  delete from public.rate_limits where expires_at < current_time_value;
  insert into public.rate_limits as existing (key, count, expires_at)
  values (p_key, 1, current_time_value + interval '1 minute')
  on conflict (key) do update set
    count = case when existing.expires_at <= current_time_value then 1 else existing.count + 1 end,
    expires_at = case when existing.expires_at <= current_time_value then current_time_value + interval '1 minute' else existing.expires_at end
  returning count into used;
  return used <= p_limit;
end;
$$;
revoke all on function public.consume_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer) to service_role;
commit;
