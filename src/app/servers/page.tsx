'use client';

import * as React from 'react';
import { servers as initialServers } from '@/lib/data';
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
import { PlusCircle, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ServerForm } from './components/server-form';

export default function ServersPage() {
  const { t } = useLanguage();
  const [servers, setServers] = React.useState<Server[]>(initialServers);
  const [editingServer, setEditingServer] = React.useState<Server | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const handleAddServer = () => {
    setEditingServer(null);
    setIsFormOpen(true);
  };

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: Omit<Server, 'id'>) => {
    if (editingServer) {
      setServers(
        servers.map((s) =>
          s.id === editingServer.id ? { ...editingServer, ...values } : s
        )
      );
    } else {
      const newServer: Server = {
        ...values,
        id: `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`,
      };
      setServers([newServer, ...servers]);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('serverManagement')}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t('serverManagementDescription')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild size="lg">
              <Link href="/servers/configure">
                <Settings className="mr-2 h-5 w-5" />
                {t('validateConfiguration')}
              </Link>
            </Button>
            <Button size="lg" onClick={handleAddServer}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('addPanel')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{server.name}</CardTitle>
                  <Badge
                    variant={
                      server.status === 'Online' ? 'default' : 'destructive'
                    }
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        server.status === 'Online'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      )}
                    />
                    {t(server.status.toLowerCase() as 'online' | 'offline')}
                  </Badge>
                </div>
                <CardDescription className="pt-1 text-base">
                  {server.url}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div>
                  <div className="mb-2 flex justify-between text-base">
                    <span className="font-medium">{t('connections')}</span>
                    <span className="text-muted-foreground">
                      {server.connections} / {server.maxConnections}
                    </span>
                  </div>
                  <Progress
                    value={(server.connections / server.maxConnections) * 100}
                  />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-base">
                    <span className="font-medium">{t('cpuLoad')}</span>
                    <span className="text-muted-foreground">
                      {server.cpuLoad}%
                    </span>
                  </div>
                  <Progress
                    value={server.cpuLoad}
                    className={cn(
                      server.cpuLoad > 90
                        ? '[&>div]:bg-destructive'
                        : server.cpuLoad > 75
                        ? '[&>div]:bg-yellow-500'
                        : ''
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                 <Button variant="outline" className="w-full" onClick={() => handleEditServer(server)} size="lg">
                    <Settings className="mr-2 h-5 w-5" />
                    {t('edit')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingServer ? t('editServer') : t('panelAndServerRegistration')}
            </DialogTitle>
            <DialogDescription>
              {editingServer
                ? t('editServerDescription')
                : ''}
            </DialogDescription>
          </DialogHeader>
          <ServerForm
            server={editingServer}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
