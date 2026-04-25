'use client';

import { createContext, useContext } from 'react';
import { signIn, signOut, signUp, useSession } from '@/lib/auth-client';

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const loading = isPending;

  const login: AuthContextType['login'] = async (email, password, rememberMe) => {
    const { error } = await signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: '/dashboard',
    });

    return { error: error?.message ?? null };
  };

  const register: AuthContextType['register'] = async (name, email, password) => {
    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: '/dashboard',
    });

    return { error: error?.message ?? null };
  };

  const signInWithGoogle: AuthContextType['signInWithGoogle'] = async () => {
    const { error } = await signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });

    return { error: error?.message ?? null };
  };

  const logout: AuthContextType['logout'] = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, login, register, signInWithGoogle, logout }}>
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
