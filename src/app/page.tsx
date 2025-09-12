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
import { clients, servers } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';

export default function Dashboard() {
  const { t } = useLanguage();
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

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {t('lastMonth.plus10')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('serversOnline')}
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineServers} / {servers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('allSystemsOperational')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('newSubscriptions')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+25</div>
            <p className="text-xs text-muted-foreground">
              {t('lastMonth.plus12')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recentAlerts')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              {t('highCPU')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-fr gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('welcome')}</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                {t('welcomeMessage')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/clients">
                  {t('manageClients')} <PlusCircle />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('configureServers')}</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                {t('configureServersMessage')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/servers/configure">
                  {t('validateConfiguration')} <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                {t('quickManagement')}
              </CardTitle>
              <CardDescription>
                {t('quickManagementMessage')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 p-6 sm:grid-cols-2">
            <div className="group relative">
              {clientImage && (
                <Image
                  src={clientImage.imageUrl}
                  alt={clientImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={clientImage.imageHint}
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 rounded-lg bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{t('clients')}</h3>
                <p className="text-sm text-white/90">{t('viewAndManageClients')}</p>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/clients">
                    {t('goToClients')} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="group relative">
              {serverImage && (
                <Image
                  src={serverImage.imageUrl}
                  alt={serverImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={serverImage.imageHint}
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 rounded-lg bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{t('servers')}</h3>
                <p className="text-sm text-white/90">{t('monitorServerStatus')}</p>
                 <Button asChild size="sm" className="mt-2">
                  <Link href="/servers">
                    {t('goToServers')} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
