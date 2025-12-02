import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAuth] Mounting and initializing auth...');
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[useAuth] Getting session...');
        
        // Set a timeout to prevent indefinite hanging
        const timeout = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            console.warn('[useAuth] Session timeout after 3 seconds');
            reject(new Error('Timeout'));
          }, 3000);
        });

        const sessionPromise = supabase.auth.getSession();

        const result = await Promise.race([
          sessionPromise,
          timeout
        ]).catch((err) => {
          console.error('[useAuth] Session fetch failed:', err);
          return { data: { session: null }, error: err };
        }) as any;

        clearTimeout(timeoutId);

        const session = result?.data?.session || null;
        console.log('[useAuth] Session retrieved:', session ? 'User logged in' : 'No session');

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('[useAuth] Auth state updated - loading complete');
        }
      } catch (error) {
        console.error('[useAuth] Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          console.log('[useAuth] Auth state cleared due to error');
        }
      }
    };

    initAuth();

    console.log('[useAuth] Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[useAuth] Auth state changed:', _event, session ? 'User logged in' : 'No session');
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      console.log('[useAuth] Unmounting and cleaning up...');
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
  };
};
