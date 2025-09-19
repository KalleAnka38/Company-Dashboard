import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logSecurityEvent } from '../security/logger';
import { Database } from './database.types';
// Option 1: Hardcoded values (safer for client-side code)
const supabaseUrl = 'https://oxmikdfvvoadhkbjjnyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWlrZGZ2dm9hZGhrYmpqbnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTYwNjEsImV4cCI6MjA3MjY3MjA2MX0.Vv4o5bybkkDNPHO3IlwCwDztj9UiepVCBtSIpJST2pE';
// Validate configuration
if (!supabaseUrl.includes('supabase.co') || !supabaseAnonKey.startsWith('eyJ')) {
  console.warn('Supabase configuration not properly set. Using mock/development mode.');
}
// Create a singleton instance
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
// Create a function to create a Supabase client (for cases where you need a fresh instance)
export const createClient = () => createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
// Log authentication events
supabase.auth.onAuthStateChange((event, session) => {
  logSecurityEvent({
    type: 'AUTH',
    level: 'INFO',
    message: `Auth state changed: ${event}`,
    data: {
      event,
      userId: session?.user?.id
    }
  });
});
/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any, context: string): never {
  logSecurityEvent({
    type: 'ACCESS',
    level: 'ERROR',
    message: `Supabase error in ${context}`,
    data: {
      error: error.message,
      code: error.code
    }
  });
  throw new Error(`${context}: ${error.message}`);
}