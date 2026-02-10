// ═══════════════════════════════════════
// DevPath — Supabase Client Configuration
// Lazy-initialized to avoid SSG build errors
// ═══════════════════════════════════════

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let _supabase: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

  // Guard: don't create client without credentials (SSG build)
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op proxy that won't crash during build
    return new Proxy({} as SupabaseClient<Database>, {
      get(_target, prop) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }),
            signOut: async () => ({ error: null }),
            setSession: async () => ({ data: { session: null, user: null }, error: null }),
            resetPasswordForEmail: async () => ({ error: null }),
            updateUser: async () => ({ data: { user: null }, error: null }),
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: [], error: null }), data: [], error: null }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
            update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }) }),
            upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
            delete: () => ({ eq: () => ({ data: null, error: null }) }),
          });
        }
        return undefined;
      },
    });
  }

  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export as a getter that lazily initializes
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});

// Re-export useful types
export type { Session, User } from "@supabase/supabase-js";
