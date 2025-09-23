
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
import { AuthProvider, useAuth } from '@/hooks/use-auth';
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
    return <>{children}</>;
  }
  
  if (pathname === '/login') {
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
};


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        <DataProvider>
            <ProtectedLayout>{children}</ProtectedLayout>
        </DataProvider>
    </AuthProvider>
  );
}
