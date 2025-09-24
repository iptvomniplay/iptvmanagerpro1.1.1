
'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import Header from './header';
import { useData } from '@/hooks/use-data';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isDataLoaded } = useData();
  const router = useRouter();

  React.useEffect(() => {
    if (isDataLoaded && !isAuthenticated) {
      router.push('/login');
    }
  }, [isDataLoaded, isAuthenticated, router]);

  if (!isDataLoaded || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
