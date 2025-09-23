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
import { usePathname } from 'next/navigation';
import LoginPage from '@/app/login/page';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isDataLoaded } = useData();
  const pathname = usePathname();

  if (!isDataLoaded) {
    // Você pode mostrar um spinner de carregamento aqui
    return <div className="flex h-screen w-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return <LoginPage />;
  }
  
  if (isAuthenticated && pathname === '/login') {
    // Redireciona se já estiver autenticado e na página de login
    return null; 
  }
  
  if (!isAuthenticated) {
     return <>{children}</>;
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
