'use client';

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'powertrack.isLoggedIn';

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // restore auth state from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === '1';
      setIsLoggedIn(stored);
    } catch (e) {
      // If reading localStorage fails (e.g., privacy mode), default to logged out
      // and surface the error for debugging when available.
      // eslint-disable-next-line no-console
      console.warn('Auth restore failed', e);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async () => {
    // simulate any async work (e.g., token exchange); keep API async-friendly
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Auth login: unable to persist state', e);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Auth logout: unable to clear state', e);
    }
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
