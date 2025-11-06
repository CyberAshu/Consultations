import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto-refresh since we're using backend auth
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  realtime: {
    // Enable realtime features
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Set Supabase auth session from your backend JWT token
 * Call this after user logs in through your backend
 */
export const setSupabaseAuth = (accessToken: string, refreshToken?: string) => {
  supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || '',
  });
};

/**
 * Clear Supabase auth session
 * Call this when user logs out
 */
export const clearSupabaseAuth = () => {
  supabase.auth.signOut();
};
