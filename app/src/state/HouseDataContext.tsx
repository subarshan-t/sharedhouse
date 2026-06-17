import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type {
  BillingPeriod, Expense, Household, LedgerEntry, Member, WeeksHome,
} from '../lib/types';
import { HouseDataContext, type AddExpenseInput, type Party } from './houseDataContextObj';

export type { Party } from './houseDataContextObj';

export function HouseDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<BillingPeriod | null>(null);
  const [weeksHome, setWeeksHome] = useState<WeeksHome[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  async function refresh() {
    setLoading(true);
    const { data: households } = await supabase.from('households').select('*').limit(1);
    const h = households?.[0] ?? null;
    setHousehold(h);
    if (!h) {
      setMembers([]); setCurrentPeriod(null); setWeeksHome([]); setExpenses([]); setLedgerEntries([]);
      setLoading(false);
      return;
    }

    const [membersRes, periodsRes] = await Promise.all([
      supabase.from('members').select('*').eq('household_id', h.id).order('created_at'),
      supabase.from('billing_periods').select('*').eq('household_id', h.id).eq('is_current', true).limit(1),
    ]);
    const m = membersRes.data ?? [];
    const period = periodsRes.data?.[0] ?? null;
    setMembers(m);
    setCurrentPeriod(period);

    const [weeksRes, expensesRes, ledgerRes] = await Promise.all([
      period
        ? supabase.from('weeks_home').select('*').eq('period_id', period.id)
        : Promise.resolve({ data: [] as WeeksHome[] }),
      supabase.from('expenses').select('*').eq('household_id', h.id).order('created_at', { ascending: false }),
      supabase.from('ledger_entries').select('*').eq('household_id', h.id),
    ]);
    setWeeksHome(weeksRes.data ?? []);
    setExpenses(expensesRes.data ?? []);
    setLedgerEntries(ledgerRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() must run whenever the session changes
    if (session) refresh();
  }, [session]);

  const currentMember = useMemo(
    () => members.find((m) => m.user_id === session?.user.id) ?? null,
    [members, session],
  );

  const totalWeeks = useMemo(() => weeksHome.reduce((a, w) => a + w.weeks, 0), [weeksHome]);

  function weeksFor(memberId: string): number {
    return weeksHome.find((w) => w.member_id === memberId)?.weeks ?? 0;
  }

  function balanceFor(memberId: string): number {
    return ledgerEntries
      .filter((e) => e.member_id === memberId)
      .reduce((a, e) => a + Number(e.amount), 0);
  }

  function memberById(memberId: string | null): Member | undefined {
    if (!memberId) return undefined;
    return members.find((m) => m.id === memberId);
  }

  const periodExpenses = useMemo(
    () => expenses.filter((e) => e.category !== 'common' && e.period_id === currentPeriod?.id),
    [expenses, currentPeriod],
  );
  const commonExpenses = useMemo(
    () => expenses.filter((e) => e.category === 'common'),
    [expenses],
  );

  const parties = useMemo<Party[]>(() => {
    const primary = members.filter((m) => m.is_primary_tenant);
    const nonPrimary = members.filter((m) => !m.is_primary_tenant);

    const groups = new Map<string, Member[]>();
    for (const mem of nonPrimary) {
      const key = mem.couple_group ?? mem.id;
      const list = groups.get(key);
      if (list) list.push(mem); else groups.set(key, [mem]);
    }

    const owing: Party[] = [...groups.entries()].map(([key, mems]) => ({
      id: key,
      label: mems.map((m) => m.display_name).join(' & '),
      memberIds: mems.map((m) => m.id),
      isPrimary: false,
      balance: mems.reduce((a, m) => a + balanceFor(m.id), 0),
      color: mems[0].color,
      initials: mems.map((m) => m.initials).join(''),
      role: mems.length > 1
        ? `Tenants · here ${Math.round(Math.max(...mems.map((m) => weeksFor(m.id))))} weeks`
        : `Tenant · here ${Math.round(weeksFor(mems[0].id))} weeks`,
    }));

    const result: Party[] = [];
    if (primary.length) {
      result.push({
        id: 'house',
        label: primary.map((m) => m.display_name).join(' & '),
        memberIds: primary.map((m) => m.id),
        isPrimary: true,
        balance: owing.reduce((a, p) => a + p.balance, 0),
        color: primary[0].color,
        initials: primary.map((m) => m.initials).join(''),
        role: 'Primary tenants · front the house',
      });
    }
    result.push(...owing);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, ledgerEntries, weeksHome]);

  const myParty = useMemo(() => {
    if (!currentMember) return null;
    if (currentMember.is_primary_tenant) return parties.find((p) => p.isPrimary) ?? null;
    return parties.find((p) => !p.isPrimary && p.memberIds.includes(currentMember.id)) ?? null;
  }, [parties, currentMember]);

  async function addExpense(input: AddExpenseInput) {
    if (!household || !currentMember) return;
    const periodId = input.category === 'common' ? null : currentPeriod?.id ?? null;
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        household_id: household.id,
        period_id: periodId,
        name: input.name,
        provider: input.provider || null,
        category: input.category,
        amount: input.amount,
        split_mode: input.splitMode,
        paid_by: input.paidBy,
        logged_by: currentMember.id,
      })
      .select()
      .single();
    if (error) throw error;

    if (input.splitMode === 'custom' && input.customShares) {
      const rows = Object.entries(input.customShares)
        .filter(([, amt]) => amt > 0)
        .map(([memberId, amt]) => ({
          household_id: household.id,
          member_id: memberId,
          kind: 'expense' as const,
          amount: amt,
          ref_expense_id: expense.id,
          note: input.name,
          created_by: currentMember.id,
        }));
      if (rows.length) {
        const { error: ledgerErr } = await supabase.from('ledger_entries').insert(rows);
        if (ledgerErr) throw ledgerErr;
      }
    }
    await refresh();
  }

  async function settleParty(party: Party, amount: number) {
    if (!household || !currentMember) return;
    const rawBalances = party.memberIds.map((id) => Math.max(balanceFor(id), 0));
    const sum = rawBalances.reduce((a, b) => a + b, 0);
    const shares = sum > 0
      ? rawBalances.map((b) => Math.round((amount * b / sum) * 100) / 100)
      : party.memberIds.map(() => Math.round((amount / party.memberIds.length) * 100) / 100);
    const diff = Math.round((amount - shares.reduce((a, b) => a + b, 0)) * 100) / 100;
    shares[shares.length - 1] = Math.round((shares[shares.length - 1] + diff) * 100) / 100;

    const rows = party.memberIds.map((id, i) => ({
      household_id: household.id,
      member_id: id,
      kind: 'settlement' as const,
      amount: -shares[i],
      created_by: currentMember.id,
      note: 'Settlement',
    }));
    const { error } = await supabase.from('ledger_entries').insert(rows);
    if (error) throw error;
    await refresh();
  }

  async function updateWeeks(memberId: string, weeks: number) {
    if (!currentPeriod) return;
    const { error } = await supabase
      .from('weeks_home')
      .upsert({ period_id: currentPeriod.id, member_id: memberId, weeks }, { onConflict: 'period_id,member_id' });
    if (error) throw error;
    await refresh();
  }

  return (
    <HouseDataContext.Provider
      value={{
        loading, household, members, currentMember, currentPeriod, weeksHome,
        periodExpenses, commonExpenses, ledgerEntries, parties, myParty, totalWeeks,
        weeksFor, balanceFor, memberById, refresh, addExpense, settleParty, updateWeeks,
      }}
    >
      {children}
    </HouseDataContext.Provider>
  );
}
