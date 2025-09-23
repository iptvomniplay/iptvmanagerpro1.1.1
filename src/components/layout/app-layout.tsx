
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import Header from './header';
import { DataProvider } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '../ui/skeleton';

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
    // Se não há usuário e não estamos na página de login, renderiza o filho (que deve ser a página de login)
    return <>{children}</>;
  }
  
  if (pathname === '/login') {
     // Se há um usuário e estamos na página de login, o hook de autenticação já deve ter nos redirecionado,
     // mas como fallback, não renderizamos nada para evitar flash de conteúdo.
    return null;
  }

  return (
    <DataProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="flex-1 p-6 md:p-8 lg:p-10 bg-background">{children}</main>
          </SidebarInset>
        </SidebarProvider>
    </DataProvider>
  );
};


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
      <ProtectedLayout>{children}</ProtectedLayout>
  );
}
