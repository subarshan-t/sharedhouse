-- Seeds the real house: Yash & Sayli (primary tenants), Suban & Midhu (couple),
-- Harleen (single) — plus the current quarter's bills and common pool.
-- Run this once, after schema.sql. Safe to re-run only on a fresh database
-- (it does not check for existing rows).

do $$
declare
  v_household_id uuid;
  v_period_id uuid;
  v_yash uuid; v_sayli uuid; v_suban uuid; v_midhu uuid; v_harleen uuid;
begin
  insert into households(name, accent_color, dark_default)
  values ('6B Chapel Street', '#14B8A6', false)
  returning id into v_household_id;

  insert into members(household_id, username, display_name, initials, color, couple_group, is_primary_tenant, weekly_rent, move_in_date)
  values (v_household_id, 'yash', 'Yash', 'Y', '#FBD3BE', 'yash-sayli', true, 0, current_date - interval '1 year')
  returning id into v_yash;

  insert into members(household_id, username, display_name, initials, color, couple_group, is_primary_tenant, weekly_rent, move_in_date)
  values (v_household_id, 'sayli', 'Sayli', 'Sa', '#FBE39B', 'yash-sayli', true, 0, current_date - interval '1 year')
  returning id into v_sayli;

  insert into members(household_id, username, display_name, initials, color, couple_group, is_primary_tenant, weekly_rent, move_in_date)
  values (v_household_id, 'suban', 'Suban', 'Su', '#BFE0FB', 'suban-midhu', false, 150, current_date - interval '9 weeks')
  returning id into v_suban;

  insert into members(household_id, username, display_name, initials, color, couple_group, is_primary_tenant, weekly_rent, move_in_date)
  values (v_household_id, 'midhu', 'Midhu', 'M', '#D6D2FB', 'suban-midhu', false, 150, current_date - interval '9 weeks')
  returning id into v_midhu;

  insert into members(household_id, username, display_name, initials, color, couple_group, is_primary_tenant, weekly_rent, move_in_date)
  values (v_household_id, 'harleen', 'Harleen', 'H', '#BFEFCF', null, false, 250, current_date - interval '13 weeks')
  returning id into v_harleen;

  insert into billing_periods(household_id, label, start_date, end_date, is_current)
  values (v_household_id, 'Apr – Jun 2025', current_date - interval '13 weeks', current_date, true)
  returning id into v_period_id;

  insert into weeks_home(period_id, member_id, weeks) values
    (v_period_id, v_yash, 2), (v_period_id, v_sayli, 2),
    (v_period_id, v_suban, 9), (v_period_id, v_midhu, 9),
    (v_period_id, v_harleen, 13);

  insert into expenses(household_id, period_id, name, provider, category, amount, split_mode, paid_by, logged_by) values
    (v_household_id, v_period_id, 'Electricity', 'AGL',       'electricity', 420, 'weeks', v_sayli, v_sayli),
    (v_household_id, v_period_id, 'Gas',         'Origin',    'gas',         210, 'weeks', v_yash,  v_yash),
    (v_household_id, v_period_id, 'Water',       'SA Water',  'water',       140, 'weeks', v_sayli, v_sayli),
    (v_household_id, v_period_id, 'Internet',    'Aussie BB', 'internet',    280, 'weeks', v_yash,  v_yash);

  insert into expenses(household_id, period_id, name, provider, category, amount, split_mode, paid_by, logged_by) values
    (v_household_id, null, 'Rat trap',            'Bunnings',   'common', 25, 'equal', v_yash,  v_yash),
    (v_household_id, null, 'Dish soap & sponges', 'Woolworths', 'common', 18, 'equal', v_sayli, v_sayli);

  perform ensure_rent_ledger(v_household_id);
end $$;
