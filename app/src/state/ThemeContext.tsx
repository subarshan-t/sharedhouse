import { useState, type ReactNode } from 'react';
import { THEME } from '../lib/calc';
import { ThemeContext } from './themeContextObj';

const STORAGE_KEY = 'hearth-dark-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) === '1');

  function toggleDark() {
    setDark((d) => {
      const next = !d;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, t: THEME[dark ? 'dark' : 'light'] }}>
      {children}
    </ThemeContext.Provider>
  );
}
