'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Server,
  Users,
  PlusCircle,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';
import { subDays, startOfMonth, startOfYear, isWithinInterval } from 'date-fns';

export default function Dashboard() {
  const { t } = useLanguage();
  const { clients, servers } = useData();
  const { newSubscriptionsPeriod } = useDashboardSettings();

  const clientImage = PlaceHolderImages.find(
    (img) => img.id === 'dashboard-clients'
  );
  const serverImage = PlaceHolderImages.find(
    (img) => img.id === 'dashboard-servers'
  );
  const onlineServers = servers.filter(
    (server) => server.status === 'Online'
  ).length;
  const totalClients = clients.length;

  const getNewSubscriptionsCount = () => {
    const now = new Date();
    let interval: Interval;

    switch (newSubscriptionsPeriod) {
      case 'today':
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));
        interval = { start: startOfToday, end: endOfToday };
        break;
      case 'last_30_days':
        interval = { start: subDays(now, 30), end: now };
        break;
      case 'this_year':
        interval = { start: startOfYear(now), end: now };
        break;
      case 'this_month':
      default:
        interval = { start: startOfMonth(now), end: now };
        break;
    }

    return clients.filter(client => 
      client.activationDate && isWithinInterval(new Date(client.activationDate), interval)
    ).length;
  };
  
  const newSubscriptionsCount = getNewSubscriptionsCount();


  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-10">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t('totalClients')}</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {t('serversOnline')}
            </CardTitle>
            <Server className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {onlineServers} / {servers.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('allSystemsOperational')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {t('newSubscriptions')}
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{newSubscriptionsCount}</div>
            <p className="text-sm text-muted-foreground">
              {t(newSubscriptionsPeriod, t('thisMonth'))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t('recentAlerts')}</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">
              {t('highCPU')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-fr gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>{t('welcome')}</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed text-base">
                {t('welcomeMessage')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>{t('configureServers')}</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed text-base">
                {t('configureServersMessage')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild size="lg">
                <Link href="/servers">
                  {t('goToServers')} <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="flex flex-row items-start bg-muted/50 p-6">
            <div className="grid gap-1">
              <CardTitle className="group flex items-center gap-2 text-xl">
                {t('quickManagement')}
              </CardTitle>
              <CardDescription>
                {t('quickManagementMessage')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
             <Card className="group flex flex-col justify-between hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>{t('clients')}</CardTitle>
                  <CardDescription>{t('viewAndManageClients')}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="mt-auto">
                    <Link href="/clients">
                      {t('goToClients')} <ArrowRight />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="group flex flex-col justify-between hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <Server className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>{t('servers')}</CardTitle>
                  <CardDescription>{t('monitorServerStatus')}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="mt-auto">
                    <Link href="/servers">
                      {t('goToServers')} <ArrowRight />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
