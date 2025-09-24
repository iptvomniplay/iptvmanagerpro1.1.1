
'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { usePathname, useRouter } from 'next/navigation';
import AppLayout from './app-layout';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDataLoaded } = useData();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (isDataLoaded && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isDataLoaded, isAuthenticated, router, pathname]);

  if (!isDataLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <AppLayout>{children}</AppLayout>;
  }

  return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Redirecionando para o login...</p>
      </div>
  );
}
