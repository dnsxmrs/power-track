'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';

export default function Page() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.replace('/dashboard');
      } else {
        router.replace('/sign-in');
      }
    }
  }, [isLoggedIn, loading, router]);

  return null;
}

