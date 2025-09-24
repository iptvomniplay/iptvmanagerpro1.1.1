
'use client';

import * as React from 'react';
import AppLayout from './app-layout';
import { usePathname } from 'next/navigation';
import { useData } from '@/hooks/use-data';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDataLoaded } = useData();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!isDataLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
