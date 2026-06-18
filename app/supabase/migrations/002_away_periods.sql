-- Migration: away periods + auto-computed weeks_home
-- Run this once against the live database (it's additive/idempotent and safe
-- to run even though schema.sql has already been applied once before).

alter table weeks_home add column if not exists is_manual boolean not null default false;

create table if not exists away_periods (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date > start_date),
  note text,
  created_by uuid references members(id),
  created_at timestamptz not null default now()
);

create index if not exists away_periods_member_idx on away_periods(member_id);

create or replace function compute_member_weeks(p_member_id uuid, p_period_id uuid)
returns numeric as $$
declare
  v_move_in date;
  v_start date;
  v_end date;
  v_present_start date;
  v_days numeric;
  r record;
  overlap_days numeric;
begin
  select move_in_date into v_move_in from members where id = p_member_id;
  select start_date, end_date into v_start, v_end from billing_periods where id = p_period_id;
  if v_move_in is null or v_start is null then return 0; end if;

  v_present_start := greatest(v_start, v_move_in);
  v_days := greatest(0, v_end - v_present_start);

  for r in
    select start_date, end_date from away_periods
    where member_id = p_member_id and start_date < v_end and end_date > v_present_start
  loop
    overlap_days := least(v_end, r.end_date) - greatest(v_present_start, r.start_date);
    if overlap_days > 0 then
      v_days := v_days - overlap_days;
    end if;
  end loop;

  return round(greatest(v_days, 0) / 7.0, 2);
end;
$$ language plpgsql security definer stable;

create or replace function recompute_weeks_home(p_period_id uuid) returns void as $$
declare
  v_household_id uuid;
  r record;
begin
  select household_id into v_household_id from billing_periods where id = p_period_id;
  if v_household_id is null then return; end if;

  for r in select id from members where household_id = v_household_id loop
    insert into weeks_home(period_id, member_id, weeks, is_manual)
    values (p_period_id, r.id, compute_member_weeks(r.id, p_period_id), false)
    on conflict (period_id, member_id) do update
      set weeks = excluded.weeks
      where weeks_home.is_manual = false;
  end loop;
end;
$$ language plpgsql security definer;

grant execute on function recompute_weeks_home(uuid) to authenticated;

create or replace function fn_recompute_on_away() returns trigger as $$
declare
  v_member_id uuid;
  r record;
begin
  v_member_id := coalesce(new.member_id, old.member_id);
  for r in
    select p.id from billing_periods p
    join members m on m.id = v_member_id
    where p.household_id = m.household_id
  loop
    perform recompute_weeks_home(r.id);
  end loop;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_recompute_on_away on away_periods;
create trigger trg_recompute_on_away after insert or update or delete on away_periods
for each row execute function fn_recompute_on_away();

create or replace function fn_recompute_on_move_in() returns trigger as $$
declare
  r record;
begin
  if new.move_in_date is distinct from old.move_in_date then
    for r in select id from billing_periods where household_id = new.household_id loop
      perform recompute_weeks_home(r.id);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_recompute_on_move_in on members;
create trigger trg_recompute_on_move_in after update on members
for each row execute function fn_recompute_on_move_in();

create or replace function fn_recompute_on_new_period() returns trigger as $$
begin
  perform recompute_weeks_home(new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_recompute_on_new_period on billing_periods;
create trigger trg_recompute_on_new_period after insert on billing_periods
for each row execute function fn_recompute_on_new_period();

-- claim_or_create_member now delegates to recompute_weeks_home instead of a flat insert
create or replace function claim_or_create_member(p_username text, p_display_name text)
returns members as $$
declare
  v_household_id uuid;
  v_member members;
  v_initial text;
  v_colors text[] := array['#FBD3BE','#FBE39B','#BFE0FB','#D6D2FB','#BFEFCF','#FBC9D9'];
begin
  select id into v_household_id from households order by created_at asc limit 1;
  if v_household_id is null then
    insert into households(name) values ('My House') returning id into v_household_id;
  end if;

  select * into v_member from members where username = lower(p_username);

  if v_member.id is null then
    v_initial := upper(left(p_display_name, 1));
    insert into members(household_id, user_id, username, display_name, initials, color, weekly_rent, move_in_date)
    values (
      v_household_id, auth.uid(), lower(p_username), p_display_name, v_initial,
      v_colors[1 + (floor(random() * array_length(v_colors,1)))::int],
      0, current_date
    )
    returning * into v_member;
  elsif v_member.user_id is null then
    update members set user_id = auth.uid() where id = v_member.id returning * into v_member;
  elsif v_member.user_id <> auth.uid() then
    raise exception 'That username is already taken.';
  end if;

  perform recompute_weeks_home(p.id)
  from billing_periods p
  where p.household_id = v_household_id and p.is_current = true;

  return v_member;
end;
$$ language plpgsql security definer;

grant execute on function claim_or_create_member(text, text) to authenticated;

alter table away_periods enable row level security;

create or replace function is_household_member(p_household_id uuid) returns boolean as $$
  select exists (
    select 1 from members where household_id = p_household_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

drop policy if exists away_select on away_periods;
drop policy if exists away_insert on away_periods;
drop policy if exists away_update on away_periods;
drop policy if exists away_delete on away_periods;
create policy away_select on away_periods for select using (is_household_member(household_id));
create policy away_insert on away_periods for insert with check (is_household_member(household_id));
create policy away_update on away_periods for update using (is_household_member(household_id));
create policy away_delete on away_periods for delete using (is_household_member(household_id));

-- Backfill: recompute weeks_home for every existing billing period now that
-- the auto-calc functions exist.
do $$
declare r record;
begin
  for r in select id from billing_periods loop
    perform recompute_weeks_home(r.id);
  end loop;
end $$;
