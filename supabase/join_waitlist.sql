-- Mend waitlist — run once in Supabase SQL Editor (project sdibcnpczpnizvezvlxv)
-- Matches client: joinWaitlist → rpc('join_waitlist', { p_email, p_list, p_source, p_utm_*, p_referrer })

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  list text not null check (list in ('main', 'mendboards')),
  source text not null check (source in ('hero', 'mendboards', 'final-cta')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  created_at timestamptz not null default now(),
  unique (email, list)
);

create index if not exists waitlist_list_created_at_idx
  on public.waitlist (list, created_at);

alter table public.waitlist enable row level security;

-- No direct table access from the browser — RPC only
revoke all on table public.waitlist from anon, authenticated;
grant select, insert on table public.waitlist to service_role;

create or replace function public.join_waitlist(
  p_email text,
  p_list text,
  p_source text,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_referrer text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_existing public.waitlist%rowtype;
  v_position int;
begin
  if v_email is null or v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  if p_list is null or p_list not in ('main', 'mendboards') then
    raise exception 'invalid_list' using errcode = '22023';
  end if;

  if p_source is null or p_source not in ('hero', 'mendboards', 'final-cta') then
    raise exception 'invalid_source' using errcode = '22023';
  end if;

  select * into v_existing
  from public.waitlist
  where email = v_email and list = p_list;

  if found then
    select count(*)::int into v_position
    from public.waitlist w
    where w.list = p_list
      and w.created_at <= v_existing.created_at;

    return jsonb_build_object(
      'status', 'already',
      'position', v_position
    );
  end if;

  insert into public.waitlist (
    email, list, source, utm_source, utm_medium, utm_campaign, referrer
  ) values (
    v_email,
    p_list,
    p_source,
    nullif(p_utm_source, ''),
    nullif(p_utm_medium, ''),
    nullif(p_utm_campaign, ''),
    nullif(p_referrer, '')
  )
  returning * into v_existing;

  select count(*)::int into v_position
  from public.waitlist w
  where w.list = p_list
    and w.created_at <= v_existing.created_at;

  return jsonb_build_object(
    'status', 'joined',
    'position', v_position
  );
end;
$$;

revoke all on function public.join_waitlist(text, text, text, text, text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text, text, text, text, text) to anon, authenticated;
