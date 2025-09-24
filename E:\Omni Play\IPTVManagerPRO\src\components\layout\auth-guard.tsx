
'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { usePathname, useRouter } from 'next/navigation';
import AppLayout from './app-layout';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDataLoaded } = useData();
  const router = useRouter();
  const pathname = usePathname();

  // Temporarily bypass authentication to allow direct access to the app.
  if (!isDataLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
