
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Home, Users, Server, Settings, Tv2, Package, Wrench, Landmark, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';

export default function SidebarNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // We don't close on desktop to allow quick navigation
  };

  const links = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/clients', label: t('clients'), icon: Users },
    { href: '/servers', label: t('servers'), icon: Server },
    { href: '/subscription', label: t('subscription'), icon: CreditCard },
    { href: '/stock', label: t('stock'), icon: Package },
    { href: '/financial', label: t('financial'), icon: Landmark },
    { href: '/utilities', label: t('utilities'), icon: Wrench },
  ];
  
  const bottomLinks = [
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-20 w-20 rounded-lg"
            asChild
          >
            <Link href="/" onClick={handleLinkClick}>
              <Tv2 className="h-12 w-12 text-primary" />
              <span className="sr-only">IPTV Manager Pro</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            IPTV Manager Pro
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4 flex flex-col justify-between">
        <div>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))}
                    tooltip={{ children: link.label }}
                    className="h-20"
                  >
                    <Link href={link.href} onClick={handleLinkClick}>
                      <link.icon className="h-9 w-9" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
        </div>
        <div>
            <SidebarMenu>
             {bottomLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === link.href}
                    tooltip={{ children: link.label }}
                    className="h-20"
                  >
                    <Link href={link.href} onClick={handleLinkClick}>
                      <link.icon className="h-9 w-9" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </>
  );
}
