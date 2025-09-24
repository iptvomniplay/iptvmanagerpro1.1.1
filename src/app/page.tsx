
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';

// This page acts as a gatekeeper. It will redirect to the correct page.
export default function HomePage() {
  const { isAuthenticated, isDataLoaded } = useData();
  const router = useRouter();

  React.useEffect(() => {
    if (isDataLoaded) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isDataLoaded, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Carregando...</p>
    </div>
  );
}
