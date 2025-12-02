import { createClient } from '@supabase/supabase-js';

console.log('[Supabase] Module loaded - SDK 52 compatible lazy init');

const supabaseUrl = 'https://tvmqkondihsomlebizjj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bXFrb25kaWhzb21sZWJpempqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQ0NjcsImV4cCI6MjA2OTI3MDQ2N30.W1fSD_RLJjcsIoJhJDnE6Xri9AIxv5DuAlN65iqI6BE';

let supabaseInstance: any = null;
let initError: Error | null = null;
let initPromise: Promise<void> | null = null;

// Lazy initialization - only create client when first accessed
const ensureInitialized = async () => {
  if (supabaseInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[Supabase] Creating client...');
      
      // Dynamically require AsyncStorage only when needed (SDK 52 compatible)
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Small delay to ensure AsyncStorage module is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      
      console.log('[Supabase] Client created successfully');
    } catch (error) {
      console.error('[Supabase] Failed to create client:', error);
      initError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  })();

  return initPromise;
};

// Create proxy that initializes on first use
const createLazyProxy = () => {
  return new Proxy({} as any, {
    get(target, prop) {
      // Special handling for auth methods
      if (prop === 'auth') {
        return {
          getSession: async () => {
            try {
              await ensureInitialized();
              return supabaseInstance?.auth.getSession() || { data: { session: null }, error: null };
            } catch (error) {
              console.error('[Supabase] getSession error:', error);
              return { data: { session: null }, error };
            }
          },
          onAuthStateChange: (...args: any[]) => {
            if (supabaseInstance) {
              return supabaseInstance.auth.onAuthStateChange(...args);
            }
            // Return dummy subscription if not initialized
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
          signInWithPassword: async (...args: any[]) => {
            await ensureInitialized();
            return supabaseInstance?.auth.signInWithPassword(...args);
          },
          signOut: async (...args: any[]) => {
            await ensureInitialized();
            return supabaseInstance?.auth.signOut(...args);
          },
        };
      }
      
      // For other methods (like .from()), ensure initialized first
      if (prop === 'from') {
        return (...args: any[]) => {
          if (!supabaseInstance) {
            throw new Error('Supabase not initialized yet. Wait for initialization.');
          }
          return supabaseInstance.from(...args);
        };
      }
      
      if (prop === 'storage') {
        return {
          from: (...args: any[]) => {
            if (!supabaseInstance) {
              throw new Error('Supabase not initialized yet. Wait for initialization.');
            }
            return supabaseInstance.storage.from(...args);
          },
        };
      }

      return supabaseInstance?.[prop];
    },
  });
};

export const supabase = createLazyProxy();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
