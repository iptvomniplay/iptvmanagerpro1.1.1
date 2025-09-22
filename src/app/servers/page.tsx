
'use client';

import * as React from 'react';
import type { Server } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle, Search, ChevronDown, Server as ServerIcon, Settings, Users, Star } from 'lucide-react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ServerDetailsModal } from './components/server-details-modal';
import { DeleteServerAlert } from './components/delete-server-alert';
import { Input } from '@/components/ui/input';
import { normalizeString, cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TransactionModal } from '../stock/components/transaction-modal';
import type { Transaction } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ServerRatingDisplay = ({ server, onClick }: { server: Server, onClick: () => void }) => {
  const { t } = useLanguage();
  const { ratings } = server;
  if (!ratings) {
    return <div className="text-muted-foreground">-</div>;
  }

  const { content = 0, support = 0, stability = 0, value = 0 } = ratings;
  const averageRating = (content + support + stability + value) / 4;
  const fullStars = Math.floor(averageRating);
  const partialStar = averageRating - fullStars;

  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
  const starColor = colors[fullStars >= 1 ? Math.min(Math.round(averageRating) - 1, 4) : 0];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                if (starValue <= fullStars) {
                  return <Star key={i} className="h-5 w-5" fill={starColor} stroke={starColor} />;
                }
                if (starValue === fullStars + 1 && partialStar > 0) {
                  return (
                      <div key={i} className="relative h-5 w-5">
                        <Star className="h-5 w-5 text-muted" fill="currentColor" />
                        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
                          <Star className="h-5 w-5" fill={starColor} stroke={starColor} />
                        </div>
                      </div>
                    );
                }
                return <Star key={i} className="h-5 w-5 text-muted" fill="currentColor" />;
              })}
            </div>
            <span className="font-bold text-base">{averageRating.toFixed(2)}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('average')}: {averageRating.toFixed(2)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


export default function ServersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { servers, clients, updateServer, deleteServer, addTransactionToServer } = useData();

  const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isListOpen, setIsListOpen] = React.useState(true);

  const filteredServers = servers.filter((server) => {
    const normalizedSearchTerm = normalizeString(searchTerm);
    return (
      normalizeString(server.name).includes(normalizedSearchTerm) ||
      (server.nickname && normalizeString(server.nickname).includes(normalizedSearchTerm)) ||
      normalizeString(server.url).includes(normalizedSearchTerm) ||
      normalizeString(server.login).includes(normalizedSearchTerm) ||
      normalizeString(server.status).includes(normalizedSearchTerm)
    );
  });

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
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!selectedServer) return;
    addTransactionToServer(selectedServer.id, transaction);
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

        <Collapsible open={isListOpen} onOpenChange={setIsListOpen} asChild>
          <Card>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-4 cursor-pointer">
                      <h3 className="text-lg font-semibold">
                        {t('registeredServersList')} ({filteredServers.length})
                      </h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:rotate-180">
                          <ChevronDown className="h-5 w-5 transition-transform" />
                      </Button>
                    </div>
                </CollapsibleTrigger>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('searchPanelPlaceholder')}
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent asChild>
              <CardContent className="p-0">
                <div className="rounded-b-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('serverName')}</TableHead>
                          <TableHead>{t('status')}</TableHead>
                          <TableHead>{t('clients')}</TableHead>
                          <TableHead>{t('reputation')}</TableHead>
                          <TableHead className="w-[180px] text-right">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredServers.length > 0 ? (
                          filteredServers.map((server) => {
                             const clientCount = clients.filter(client => 
                                client.plans?.some(plan => plan.panel.id === server.id)
                            ).length;
                            return (
                                <TableRow key={server.id} onClick={() => handleRowClick(server)} className="cursor-pointer">
                                  <TableCell className="font-medium p-4">
                                    {server.name}
                                  </TableCell>
                                  <TableCell>
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
                                  </TableCell>
                                   <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-5 w-5 text-muted-foreground" />
                                      <span className="font-semibold">{clientCount}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    <ServerRatingDisplay server={server} onClick={() => handleRowClick(server)} />
                                  </TableCell>
                                  <TableCell className="text-right p-4" onClick={(e) => e.stopPropagation()}>
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
                                                setIsTransactionModalOpen(true);
                                            }}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                {t('manage')}
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
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                               <div className="flex flex-col items-center justify-center gap-3 text-center h-48">
                                <ServerIcon className="w-12 h-12 text-muted-foreground/60" />
                                <h3 className="text-xl font-semibold">{t('noServersFound')}</h3>
                                <p className="text-muted-foreground max-w-xs">
                                  {t('noServersFoundMessage')}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
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

      {selectedServer && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          server={selectedServer}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </>
  );
}
