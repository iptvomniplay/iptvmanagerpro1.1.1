'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDataLoaded } = useData();
  const router = useRouter();

  React.useEffect(() => {
    if (isDataLoaded && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isDataLoaded, isAuthenticated, router]);

  if (!isDataLoaded || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
