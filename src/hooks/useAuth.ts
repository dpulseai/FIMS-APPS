import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAuth] Mounting...');
    let mounted = true;

    // Get initial session immediately
    const initAuth = async () => {
      try {
        console.log('[useAuth] Getting session...');
        const startTime = Date.now();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log(`[useAuth] Session retrieved in ${Date.now() - startTime}ms:`, session ? 'logged in' : 'no session');
        
        if (error) {
          console.error('[useAuth] Session error:', error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[useAuth] Auth init error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[useAuth] Auth changed:', _event);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        // Don't set loading here - it causes unnecessary re-renders
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[useAuth] Signing in...');
    const startTime = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log(`[useAuth] Sign-in completed in ${Date.now() - startTime}ms`);
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    console.log('[useAuth] Signing out...');
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
  };
};
