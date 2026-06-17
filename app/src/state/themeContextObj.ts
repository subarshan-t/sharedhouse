import { createContext } from 'react';
import type { ThemeTokens } from '../lib/calc';

export type ThemeState = {
  dark: boolean;
  toggleDark: () => void;
  t: ThemeTokens;
};

export const ThemeContext = createContext<ThemeState | null>(null);
