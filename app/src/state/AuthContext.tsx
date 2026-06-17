import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, usernameToEmail } from '../lib/supabase';
import { AuthContext } from './authContextObj';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp(username: string, password: string, displayName: string) {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const { error: claimErr } = await supabase.rpc('claim_or_create_member', {
      p_username: username.trim().toLowerCase(),
      p_display_name: displayName.trim() || username,
    });
    if (claimErr) throw claimErr;
  }

  async function signIn(username: string, password: string) {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
