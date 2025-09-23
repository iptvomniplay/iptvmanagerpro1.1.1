
'use client';

import * as React from 'react';
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
import { useRouter } from 'next/navigation';
import { Tv2 } from 'lucide-react';

const UnprotectedLayout = ({ children }: { children: ReactNode }) => {
  return <main className="flex-1 bg-background">{children}</main>;
};

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
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
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  React.useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/login');
    }
    if (!loading && user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Tv2 className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }
  
  if (isAuthPage || !user) {
    return <UnprotectedLayout>{children}</UnprotectedLayout>;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}
