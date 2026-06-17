import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars.');
}

export const supabase = createClient(url, anonKey);

// Supabase Auth requires an email; Hearth signs in by username only, so we
// map usernames to a synthetic address in a fixed internal domain.
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@users.hearth.app`;
}
