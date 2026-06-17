import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AuthState = {
  session: Session | null;
  loading: boolean;
  signUp: (username: string, password: string, displayName: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
