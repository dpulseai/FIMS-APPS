import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('[Supabase] Module loaded - Eager initialization');

const supabaseUrl = 'https://tvmqkondihsomlebizjj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bXFrb25kaWhzb21sZWJpempqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQ0NjcsImV4cCI6MjA2OTI3MDQ2N30.W1fSD_RLJjcsIoJhJDnE6Xri9AIxv5DuAlN65iqI6BE';

// Create client immediately on module load - no lazy loading delays
console.log('[Supabase] Creating client immediately...');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'fims-mobile',
    },
  },
  // Disable realtime for faster connections (we don't use it)
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

console.log('[Supabase] Client created successfully');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
