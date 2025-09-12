'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Users, Server, Settings, Tv2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/hooks/use-language';

export default function SidebarNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t('dashboard'), icon: Home },
    { href: '/clients', label: t('clients'), icon: Users },
    { href: '/servers', label: t('servers'), icon: Server },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg"
            asChild
          >
            <Link href="/">
              <Tv2 className="h-6 w-6 text-primary" />
              <span className="sr-only">IPTV Manager Pro</span>
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">
            IPTV Manager Pro
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </>
  );
}
