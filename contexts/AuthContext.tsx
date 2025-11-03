'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// import { User } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabase-v2';
import * as localAuth from '@/lib/local-auth-provider';
import { USE_LOCAL_AUTH } from '@/lib/config';

const DEBUG_LOG = (msg: string) => {
  return console.log('[AuthContext]', msg);
}

// Type that works with both Supabase User and LocalUser
// type AuthUser = User | localAuth.LocalUser | null;
type AuthUser = localAuth.LocalUser | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if (USE_LOCAL_AUTH) {
      // Local auth implementation
      DEBUG_LOG('Init AuthProvider: Using local auth provider');
      localAuth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for changes on auth state
      const { data: { subscription } } = localAuth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    // } 
    // else {
    //   // Supabase auth implementation
    //   supabase!.auth.getSession().then(({ data: { session } }) => {
    //     setUser(session?.user ?? null);
    //     setLoading(false);
    //   });

    //   // Listen for changes on auth state (sign in, sign out, etc.)
    //   const {
    //     data: { subscription },
    //   } = supabase!.auth.onAuthStateChange((_event, session) => {
    //     setUser(session?.user ?? null);
    //     setLoading(false);
    //   });

    //   return () => subscription.unsubscribe();
    // }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // if (USE_LOCAL_AUTH) {
        DEBUG_LOG('signUp: Using local auth provider');
        const { error } = await localAuth.signUp(email, password);
        return { error };
      // } 
      // else {
      //   const { error } = await supabase!.auth.signUp({
      //     email,
      //     password,
      //   });
      //   return { error };
      // }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // if (USE_LOCAL_AUTH) {
        DEBUG_LOG('signIn: Using local auth provider');
        const { error } = await localAuth.signInWithPassword(email, password);
        return { error };
      // } 
      // else {
      //   const { error } = await supabase!.auth.signInWithPassword({
      //     email,
      //     password,
      //   });
      //   return { error };
      // }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // if (USE_LOCAL_AUTH) {
      DEBUG_LOG('signOut: Using local auth provider');
      await localAuth.signOut();
    // } 
    // else {
    //   await supabase!.auth.signOut();
    // }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>
    {/* {!user && <AnonymousBanner />} */}
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
