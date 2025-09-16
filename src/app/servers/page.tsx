'use client';

import * as React from 'react';
import type { Server } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle, Settings, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerDetailsModal } from './components/server-details-modal';
import { DeleteServerAlert } from './components/delete-server-alert';


export default function ServersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { servers, updateServer, deleteServer } = useData();

  const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  const getStatusVariant = (status: Server['status']) => {
    switch (status) {
      case 'Online':
        return 'success';
      case 'Offline':
        return 'inactive';
      case 'Suspended':
        return 'destructive';
      case 'Maintenance':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const handleRowClick = (server: Server) => {
    setSelectedServer(server);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = () => {
    if (selectedServer) {
      setIsDetailsModalOpen(false);
      router.push(`/servers/${selectedServer.id}/edit`);
    }
  };
  
  const handleDeleteRequest = () => {
    setIsDetailsModalOpen(false);
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedServer) {
      deleteServer(selectedServer.id);
    }
    setIsDeleteAlertOpen(false);
    setSelectedServer(null);
  };
  
  const handleStatusChange = (server: Server, status: Server['status']) => {
    updateServer({ ...server, status });
  };

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('serverManagement')}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {t('serverManagementDescription')}
              </p>
            </div>
            <Button onClick={() => router.push('/servers/new')}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('addPanel')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('registeredServersList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead className="w-[180px] text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servers.length > 0 ? (
                      servers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                               <Badge 
                                  variant="secondary" 
                                  className="cursor-pointer text-base py-1 px-3 hover:bg-muted"
                                  onClick={() => handleRowClick(server)}
                                >
                                {server.name}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Badge variant={getStatusVariant(server.status)} className="cursor-pointer text-base py-1 px-3">
                                      {t(server.status.toLowerCase().replace(' ', '') as any)}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleStatusChange(server, 'Online')}>{t('online')}</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleStatusChange(server, 'Offline')}>{t('offline')}</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleStatusChange(server, 'Suspended')}>{t('suspended')}</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleStatusChange(server, 'Maintenance')}>{t('maintenance')}</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        {t('actions')}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleRowClick(server)}>
                                        {t('details')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSelectedServer(server);
                                        handleEdit();
                                    }}>
                                        {t('edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSelectedServer(server);
                                        handleDeleteRequest();
                                    }} className="text-destructive focus:text-destructive">
                                        {t('delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-28 text-center text-lg">
                          {t('noServersFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>

       {selectedServer && (
        <ServerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          server={selectedServer}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}
      
      {selectedServer && (
        <DeleteServerAlert
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirm={confirmDelete}
          serverName={selectedServer.name}
        />
      )}
    </>
  );
}
