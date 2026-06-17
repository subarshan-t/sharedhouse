export type Household = {
  id: string;
  name: string;
  accent_color: string;
  dark_default: boolean;
};

export type Member = {
  id: string;
  household_id: string;
  user_id: string | null;
  username: string;
  display_name: string;
  initials: string;
  color: string;
  couple_group: string | null;
  is_primary_tenant: boolean;
  weekly_rent: number;
  move_in_date: string;
};

export type BillingPeriod = {
  id: string;
  household_id: string;
  label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export type WeeksHome = {
  id: string;
  period_id: string;
  member_id: string;
  weeks: number;
  is_manual: boolean;
};

export type AwayPeriod = {
  id: string;
  household_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type Category = 'rent' | 'electricity' | 'gas' | 'water' | 'internet' | 'common';

export type SplitMode = 'weeks' | 'equal' | 'custom';

export type Expense = {
  id: string;
  household_id: string;
  period_id: string | null;
  name: string;
  provider: string | null;
  category: Category;
  amount: number;
  split_mode: SplitMode;
  paid_by: string | null;
  logged_by: string | null;
  created_at: string;
};

export type LedgerKind = 'rent' | 'expense' | 'settlement';

export type LedgerEntry = {
  id: string;
  household_id: string;
  member_id: string;
  kind: LedgerKind;
  amount: number;
  ref_expense_id: string | null;
  week_start: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};
