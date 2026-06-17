-- Hearth schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ───────────────────────── households ─────────────────────────
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My House',
  accent_color text not null default '#14B8A6',
  dark_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────────────────── members ─────────────────────────
-- A member may exist before they've signed up (user_id null); once they
-- create an account with a matching username, the app links it.
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  username text not null unique,
  display_name text not null,
  initials text not null,
  color text not null,
  couple_group text,
  is_primary_tenant boolean not null default false,
  weekly_rent numeric(10,2) not null default 0,
  move_in_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ───────────────────────── billing periods ─────────────────────────
create table if not exists billing_periods (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  label text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

-- editable weeks-home per person per period (denominator includes everyone)
create table if not exists weeks_home (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references billing_periods(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  weeks numeric(5,2) not null default 0,
  unique(period_id, member_id)
);

-- ───────────────────────── expenses ─────────────────────────
-- Covers both period-bound utility bills (category != 'common', period_id set)
-- and the ever-present common pool (category = 'common', period_id null).
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  period_id uuid references billing_periods(id) on delete set null,
  name text not null,
  provider text,
  category text not null default 'electricity'
    check (category in ('rent','electricity','gas','water','internet','common')),
  amount numeric(10,2) not null check (amount > 0),
  split_mode text not null default 'weeks' check (split_mode in ('weeks','equal','custom')),
  paid_by uuid references members(id),
  logged_by uuid references members(id),
  created_at timestamptz not null default now()
);

-- ───────────────────────── ledger (single source of truth for balances) ─────────────────────────
-- Only non-primary-tenant members get rows here. Positive = owed to the
-- primary tenants, negative = a payment/settlement reducing what's owed.
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('rent','expense','settlement')),
  amount numeric(10,2) not null,
  ref_expense_id uuid references expenses(id) on delete cascade,
  week_start date,
  note text,
  created_by uuid references members(id),
  created_at timestamptz not null default now()
);

create index if not exists ledger_member_idx on ledger_entries(member_id);
create index if not exists ledger_household_idx on ledger_entries(household_id);

-- ═════════════════════════ triggers: auto-generate ledger rows ═════════════════════════

-- expense insert -> one ledger row per non-primary member (skipped for split_mode='custom';
-- the client inserts custom ledger_entries itself in that case).
create or replace function fn_expense_ledger() returns trigger as $$
declare
  total_weeks numeric;
  total_members int;
  r record;
  share numeric;
begin
  if new.split_mode = 'custom' then
    return new;
  end if;

  if new.split_mode = 'weeks' then
    select coalesce(sum(weeks),0) into total_weeks from weeks_home where period_id = new.period_id;
    if total_weeks = 0 then return new; end if;
    for r in
      select m.id as member_id, wh.weeks
      from members m
      join weeks_home wh on wh.member_id = m.id and wh.period_id = new.period_id
      where m.household_id = new.household_id and m.is_primary_tenant = false
    loop
      share := round(new.amount * r.weeks / total_weeks, 2);
      insert into ledger_entries(household_id, member_id, kind, amount, ref_expense_id, note)
      values (new.household_id, r.member_id, 'expense', share, new.id, new.name);
    end loop;
  else -- 'equal'
    select count(*) into total_members from members where household_id = new.household_id;
    if total_members = 0 then return new; end if;
    for r in select id as member_id from members where household_id = new.household_id and is_primary_tenant = false
    loop
      share := round(new.amount / total_members, 2);
      insert into ledger_entries(household_id, member_id, kind, amount, ref_expense_id, note)
      values (new.household_id, r.member_id, 'expense', share, new.id, new.name);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_expense_ledger on expenses;
create trigger trg_expense_ledger after insert on expenses
for each row execute function fn_expense_ledger();

-- ═════════════════════════ rpc: ensure weekly rent charges exist up to today ═════════════════════════
create or replace function ensure_rent_ledger(p_household_id uuid) returns void as $$
declare
  r record;
  wk date;
  existing_count int;
  weeks_elapsed int;
begin
  for r in
    select id, weekly_rent, move_in_date
    from members
    where household_id = p_household_id and is_primary_tenant = false and weekly_rent > 0
  loop
    weeks_elapsed := floor((current_date - r.move_in_date) / 7) + 1;
    if weeks_elapsed < 1 then continue; end if;

    select count(*) into existing_count
    from ledger_entries
    where member_id = r.id and kind = 'rent';

    if existing_count < weeks_elapsed then
      for i in existing_count .. (weeks_elapsed - 1) loop
        wk := r.move_in_date + (i * 7);
        insert into ledger_entries(household_id, member_id, kind, amount, week_start, note)
        values (p_household_id, r.id, 'rent', r.weekly_rent, wk, 'Weekly rent')
        on conflict do nothing;
      end loop;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- ═════════════════════════ rpc: claim or create a member row on sign-up ═════════════════════════
-- Runs as the calling user (security definer reads auth.uid() from the request JWT).
-- Single-household app: the first household found is used, or created if none exists yet.
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

  insert into weeks_home(period_id, member_id, weeks)
  select p.id, v_member.id, round(extract(day from (p.end_date - p.start_date))::numeric / 7.0, 2)
  from billing_periods p
  where p.household_id = v_household_id and p.is_current = true
  on conflict (period_id, member_id) do nothing;

  return v_member;
end;
$$ language plpgsql security definer;

grant execute on function claim_or_create_member(text, text) to authenticated;
grant execute on function ensure_rent_ledger(uuid) to authenticated;

-- ═════════════════════════ row level security ═════════════════════════
alter table households enable row level security;
alter table members enable row level security;
alter table billing_periods enable row level security;
alter table weeks_home enable row level security;
alter table expenses enable row level security;
alter table ledger_entries enable row level security;

create or replace function is_household_member(p_household_id uuid) returns boolean as $$
  select exists (
    select 1 from members where household_id = p_household_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

create policy household_select on households for select using (is_household_member(id));
create policy household_update on households for update using (is_household_member(id));

create policy members_select on members for select using (is_household_member(household_id));
create policy members_update on members for update using (is_household_member(household_id));

create policy periods_select on billing_periods for select using (is_household_member(household_id));
create policy periods_insert on billing_periods for insert with check (is_household_member(household_id));

create policy weeks_select on weeks_home for select using (
  exists(select 1 from billing_periods p where p.id = period_id and is_household_member(p.household_id))
);
create policy weeks_upsert on weeks_home for insert with check (
  exists(select 1 from billing_periods p where p.id = period_id and is_household_member(p.household_id))
);
create policy weeks_update on weeks_home for update using (
  exists(select 1 from billing_periods p where p.id = period_id and is_household_member(p.household_id))
);

create policy expenses_select on expenses for select using (is_household_member(household_id));
create policy expenses_insert on expenses for insert with check (is_household_member(household_id));

create policy ledger_select on ledger_entries for select using (is_household_member(household_id));
create policy ledger_insert on ledger_entries for insert with check (is_household_member(household_id));

-- The trigger/RPC functions above are security definer and bypass RLS for
-- their own writes; direct client inserts into ledger_entries are used only
-- for settlements and custom-split expenses.
