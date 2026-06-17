import type { Category } from './types';

export function amtParts(n: number): { d: string; c: string } {
  const sign = n < 0 ? '-' : '';
  const fixed = Math.abs(n).toFixed(2);
  const [d, c] = fixed.split('.');
  return { d: sign + Number(d).toLocaleString('en-US'), c };
}

export function money(n: number): string {
  const a = amtParts(n);
  return '$' + a.d + '.' + a.c;
}

export function billShare(amount: number, memberWeeks: number, totalWeeks: number): number {
  if (totalWeeks === 0) return 0;
  return Math.round(((amount * memberWeeks) / totalWeeks) * 100) / 100;
}

export function equalShare(amount: number, memberCount: number): number {
  if (memberCount === 0) return 0;
  return Math.round((amount / memberCount) * 100) / 100;
}

export const CATS: Record<Category, { bg: string; fg: string; path: string; label: string }> = {
  rent: {
    bg: '#E9EEF6', fg: '#5277A8', label: 'Rent',
    path: 'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5',
  },
  electricity: {
    bg: '#FBF1DD', fg: '#CF9224', label: 'Electricity',
    path: 'M13 2L4 14h6l-1 8 9-12h-6z',
  },
  gas: {
    bg: '#FCEBDD', fg: '#D97A3A', label: 'Gas',
    path: 'M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 1.5 2C12 8 11 5 12 2z',
  },
  water: {
    bg: '#E4F3F8', fg: '#3796BC', label: 'Water',
    path: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  },
  internet: {
    bg: '#ECEDFB', fg: '#6A62D6', label: 'Internet',
    path: 'M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01',
  },
  common: {
    bg: '#E7F5EC', fg: '#3CA45F', label: 'Common',
    path: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
  },
};

export type ThemeTokens = {
  page: string; bg: string; surface: string; surface2: string;
  text: string; text2: string; text3: string; border: string;
  nav: string; ink: string; shadow: string;
};

export const THEME: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    page: '#E4E7E9', bg: '#FFFFFF', surface: '#F4F5F7', surface2: '#FFFFFF',
    text: '#15181B', text2: '#6B7177', text3: '#A8AEB4', border: '#EDEFF1',
    nav: '#FFFFFF', ink: '#16181B', shadow: '0 40px 90px -25px rgba(20,30,40,0.32)',
  },
  dark: {
    page: '#0B0C0E', bg: '#161719', surface: '#202225', surface2: '#2A2C30',
    text: '#F2F3F5', text2: '#9CA1A7', text3: '#63686E', border: '#2C2E31',
    nav: '#1B1C1F', ink: '#050506', shadow: '0 40px 90px -25px rgba(0,0,0,0.6)',
  },
};
