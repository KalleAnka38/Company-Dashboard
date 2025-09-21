// src/lib/supabaseClient.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logSecurityEvent } from '../security/logger';
import { Database } from './database.types';
import { supabase } from '@/lib/supabaseClient';


/**
 * Supabase Setup
 * Reads from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Make sure you set these in .env.local (for dev)
 * and in Vercel project settings (for production).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Did you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY?');
}

// Singleton Supabase client
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Factory for fresh clients (rarely needed)
export const createClient = () =>
  createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

// Log authentication events
supabase.auth.onAuthStateChange((event, session) => {
  logSecurityEvent({
    type: 'AUTH',
    level: 'INFO',
    message: `Auth state changed: ${event}`,
    data: {
      event,
      userId: session?.user?.id,
    },
  });
});

/**
 * Helper function to handle Supabase errors consistently
 */
export function handleSupabaseError(error: any, context: string): never {
  logSecurityEvent({
    type: 'ACCESS',
    level: 'ERROR',
    message: `Supabase error in ${context}`,
    data: {
      error: error.message,
      code: error.code,
    },
  });
  throw new Error(`${context}: ${error.message}`);
}

/**
 * Crunchbase Key Setup (for API fallback / live data)
 * Reads from VITE_CRUNCHBASE_API_KEY
 */
export const crunchbaseKey = import.meta.env.VITE_CRUNCHBASE_API_KEY as string;

if (!crunchbaseKey) {
  console.warn('⚠️ Missing VITE_CRUNCHBASE_API_KEY. Crunchbase fallback will not work until you set it.');
}
