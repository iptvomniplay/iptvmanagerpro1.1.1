'use client';

import * as React from 'react';
import type { Server } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PlusCircle, Settings, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export default function ServersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { servers } = useData();

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">
              {t('serverManagement')}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t('serverManagementDescription')}
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button asChild size="lg">
              <Link href="/servers/configure">
                <Settings className="mr-2 h-5 w-5" />
                {t('validateConfiguration')}
              </Link>
            </Button>
            <Button size="lg" onClick={() => router.push('/servers/new')}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('addPanel')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{server.name}</CardTitle>
                  <Badge variant={server.paymentType === 'prepaid' ? 'default' : 'secondary'}>
                    {t(server.paymentType as any)}
                  </Badge>
                </div>
                <CardDescription className="pt-1 text-base">
                  {server.url}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                {server.subServers && server.subServers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('subServerName')}</TableHead>
                          <TableHead>{t('subServerType')}</TableHead>
                          <TableHead className="text-right">{t('subServerScreens')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {server.subServers.map((sub, index) => (
                          <TableRow key={index}>
                            <TableCell>{sub.name}</TableCell>
                            <TableCell>{sub.type}</TableCell>
                            <TableCell className="text-right">{sub.screens}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('noSubServersMessage')}
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-6 pb-6">
                 <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href={`/servers/${server.id}/edit`}>
                      <Settings className="mr-2 h-5 w-5" />
                      {t('edit')}
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
