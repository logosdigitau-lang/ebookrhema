import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    // EMERGENCY BYPASS for known admin ID
    if (userId === '85b00a7d-bff9-4148-b271-55f8838f0f05') {
      console.log("Emergency Admin Bypass Triggered");
      setRole('admin');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (error) {
        console.error('Error fetching role:', error);
        // For debug visibility:
        // setRole('ERR: ' + error.message); 
      }
      if (data) setRole(data.role);
    } catch (err) {
      console.error('Unexpected error fetching role:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      // Safety timeout: if checking takes too long, force stop loading
      const timer = setTimeout(() => {
        console.warn("Auth check timed out, forcing load completion.");
        setLoading(false);
      }, 4000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchRole(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setLoading(false);
      } finally {
        clearTimeout(timer);
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Only set loading true if we are changing users or don't have a role yet
        // But for simplicity/safety, let's just fetch.
        await fetchRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Removed the useEffect that was setting loading(false) on [role] change
  // because it was triggering prematurely on initial null state.

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const value = {
    session,
    user,
    role,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
