'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Server, Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, MoreVertical, FilePenLine, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TransactionModal } from './components/transaction-modal';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteServerAlert } from '../servers/components/delete-server-alert';


export default function StockPage() {
  const { t } = useLanguage();
  const { servers, addTransactionToServer, deleteServer } = useData();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [serverToDelete, setServerToDelete] = React.useState<Server | null>(null);

  const handleOpenModal = (server: Server) => {
    setSelectedServer(server);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServer(null);
  }

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!selectedServer) return;
    addTransactionToServer(selectedServer.id, transaction);
  };

  const handleEdit = (server: Server) => {
    router.push(`/servers/${server.id}/edit`);
  };
  
  const handleDeleteRequest = (server: Server) => {
    setServerToDelete(server);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (serverToDelete) {
      deleteServer(serverToDelete.id);
    }
    setIsDeleteAlertOpen(false);
    setServerToDelete(null);
  };


  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('stockManagement')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('stockManagementDescription')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('creditBalance')}</CardTitle>
            <CardDescription>{t('creditBalanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {servers.map((server) => (
                <Card 
                    key={server.id}
                    className="transition-all"
                    style={{ boxShadow: '0 0 23px 0px rgba(255,255,255,0.6)' }}
                >
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                        <CardTitle className="text-base">{server.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="h-5 w-5"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenModal(server)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    {t('stockManagement')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(server)}>
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    {t('edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteRequest(server)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-4 pt-0 text-sm">
                        <div>
                            <p className="text-muted-foreground font-semibold text-xs">{t('paymentMethod')}</p>
                             <Badge variant={server.paymentType === 'prepaid' ? 'default' : 'info'} className="mt-1 text-xs">
                                {t(server.paymentType as any)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-semibold text-xs">{t('creditBalance')}</p>
                            <p className="font-medium text-base">{server.creditStock || 0}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {selectedServer && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          server={selectedServer}
          onAddTransaction={handleAddTransaction}
        />
      )}
       {serverToDelete && (
        <DeleteServerAlert
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirm={confirmDelete}
          