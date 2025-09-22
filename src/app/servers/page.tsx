
'use client';

import * as React from 'react';
import type { Server } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle, Search, ChevronDown, Server as ServerIcon, Settings, Users, Star, MoreVertical, Eye, EyeOff } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ServerDetailsModal } from './components/server-details-modal';
import { DeleteServerAlert } from './components/delete-server-alert';
import { Input } from '@/components/ui/input';
import { normalizeString, cn } from '@/lib/utils';
import { TransactionModal } from '../stock/components/transaction-modal';
import type { Transaction } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ServerRatingDisplay = ({ server }: { server: Server }) => {
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
          <div className="flex items-center gap-2">
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
          </div>
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
  const [isClientCountVisible, setIsClientCountVisible] = React.useState(false);

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

  const handleOpenDetails = (server: Server) => {
    setSelectedServer(server);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = (server: Server) => {
      router.push(`/servers/${server.id}/edit`);
  };
  
  const handleDeleteRequest = (server: Server) => {
    setSelectedServer(server);
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedServer) {
      deleteServer(selectedServer.id);
    }
    setIsDeleteAlertOpen(false);
    setSelectedServer(null);
  };
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!selectedServer) return;
    addTransactionToServer(selectedServer.id, transaction);
  };
  
  const handleOpenTransactionModal = (server: Server) => {
    setSelectedServer(server);
    setIsTransactionModalOpen(true);
  }

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          <div className="relative w-full max-w-sm">
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

        {filteredServers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredServers.map((server) => {
              const clientCount = clients.filter(client => 
                  client.plans?.some(plan => plan.panel.id === server.id)
              ).length;
              return (
                <Card 
                    key={server.id} 
                    className="flex flex-col [box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)]"
                >
                  <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{server.name}</CardTitle>
                        <Badge variant={getStatusVariant(server.status)} className="mt-2 text-sm">
                           {t(server.status.toLowerCase().replace(' ', '') as any)}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-5 w-5"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                           <DropdownMenuItem onClick={() => handleEdit(server)}>
                                {t('edit')}
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDeleteRequest(server)} className="text-destructive focus:text-destructive">
                                {t('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                     <div className="flex items-center justify-between text-sm text-muted-foreground">
                       <div className="flex items-center gap-3">
                         <Users className="h-5 w-5" />
                         <span className="font-semibold">{isClientCountVisible ? clientCount : '•••'} {t('clients')}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsClientCountVisible(prev => !prev)}>
                        {isClientCountVisible ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                       </Button>
                     </div>
                     <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-muted-foreground"/>
                        <ServerRatingDisplay server={server} />
                     </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenDetails(server)}>
                          <MoreVertical />
                          <span className="sr-only">{t('details')}</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleOpenTransactionModal(server)}>
                          <Settings />
                          <span className="sr-only">{t('manage')}</span>
                      </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center py-20 border-2 border-dashed rounded-xl">
              <ServerIcon className="w-16 h-16 text-muted-foreground/60" />
              <h3 className="text-2xl font-semibold">{t('noServersFound')}</h3>
              <p className="text-muted-foreground max-w-sm">
                {t('noServersFoundMessage')}
              </p>
            </div>
        )}
      </div>

       {selectedServer && (
        <ServerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          server={selectedServer}
          onEdit={() => handleEdit(selectedServer)}
          onDelete={() => handleDeleteRequest(selectedServer)}
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
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedServer(null);
          }}
          server={selectedServer}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </>
  );
}

