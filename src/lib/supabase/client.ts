// src/lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { logSecurityEvent } from '../security/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// (Optional) factory if you ever need a fresh client
export const createClient = () =>
  createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

supabase.auth.onAuthStateChange((event, session) => {
  logSecurityEvent({
    type: 'AUTH',
    level: 'INFO',
    message: `Auth state changed: ${event}`,
    data: { event, userId: session?.user?.id },
  });
});

// Optional helper if you want consistent error logging
export function handleSupabaseError(error: any, context: string): never {
  logSecurityEvent({
    type: 'ACCESS',
    level: 'ERROR',
    message: `Supabase error in ${context}`,
    data: { error: error.message, code: error.code },
  });
  throw new Error(`${context}: ${error.message}`);
}
