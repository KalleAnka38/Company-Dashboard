import React, { useEffect, useState, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import { logSecurityEvent } from '../../lib/security/logger';
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (e) {
        setError((e as Error).message);
        logSecurityEvent({
          type: 'AUTH',
          level: 'ERROR',
          message: 'Error getting initial session',
          data: {
            error: (e as Error).message
          }
        });
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();
    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return <AuthContext.Provider value={{
    user,
    loading,
    error
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);