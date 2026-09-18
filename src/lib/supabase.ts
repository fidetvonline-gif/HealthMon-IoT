import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

// Local BroadcastChannel for real-time inter-tab & intra-app instant syncing
export const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('healthmon_iot_realtime')
  : null;

export const dispatchRealtimeEvent = (type: string, payload: any) => {
  if (typeof window !== 'undefined') {
    // 1. Dispatch custom DOM event
    window.dispatchEvent(new CustomEvent('healthmon:realtime', { detail: { type, payload } }));
    // 2. Dispatch to BroadcastChannel for any other open tabs
    try {
      realtimeChannel?.postMessage({ type, payload });
    } catch {
      // ignore
    }
  }
};
