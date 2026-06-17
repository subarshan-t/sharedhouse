import { createContext } from 'react';
import type {
  BillingPeriod, Category, Expense, Household, LedgerEntry, Member, SplitMode, WeeksHome,
} from '../lib/types';

export type Party = {
  id: string;
  label: string;
  memberIds: string[];
  isPrimary: boolean;
  balance: number;
  color: string;
  initials: string;
  role: string;
};

export type AddExpenseInput = {
  name: string;
  provider?: string;
  category: Category;
  amount: number;
  splitMode: SplitMode;
  paidBy: string;
  customShares?: Record<string, number>;
};

export type HouseDataState = {
  loading: boolean;
  household: Household | null;
  members: Member[];
  currentMember: Member | null;
  currentPeriod: BillingPeriod | null;
  weeksHome: WeeksHome[];
  periodExpenses: Expense[];
  commonExpenses: Expense[];
  ledgerEntries: LedgerEntry[];
  parties: Party[];
  myParty: Party | null;
  totalWeeks: number;
  weeksFor: (memberId: string) => number;
  balanceFor: (memberId: string) => number;
  memberById: (memberId: string | null) => Member | undefined;
  refresh: () => Promise<void>;
  addExpense: (input: AddExpenseInput) => Promise<void>;
  settleParty: (party: Party, amount: number) => Promise<void>;
  updateWeeks: (memberId: string, weeks: number) => Promise<void>;
};

export const HouseDataContext = createContext<HouseDataState | null>(null);
