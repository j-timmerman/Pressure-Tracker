import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../../../../services/backend/authService';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    authService
      .getSession()
      .then((s) => {
        if (mounted) setSession(s);
      })
      .catch(() => {
        if (mounted) setSession(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = authService.onSessionChange((s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    queryClient.clear();
  }, [queryClient]);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithPassword: authService.signInWithPassword,
    signUpWithPassword: authService.signUpWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
