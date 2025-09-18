'use client';

import * as React from 'react';
import type { Client } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  FilePenLine,
  MoreHorizontal,
  PlusCircle,
  Search,
  TestTube,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClientForm } from './client-form';
import { ClientDetailsModal } from './client-details-modal';
import { useRouter } from 'next/navigation';
import { TestModal } from './test-modal';
import { normalizeString } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientExpiration } from './client-expiration';

export type ClientFormValues = Omit<Client, 'id' | 'registeredDate'>;

export default function ClientsPageContent() {
  const { t } = useLanguage();
  const { clients, deleteClient, updateClient } = useData();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(
    null
  );

  const filteredClients = clients.filter((client) => {
    const normalizedSearchTerm = normalizeString(searchTerm);
    const phoneMatch = client.phones.some(phone => normalizeString(phone.number).replace(/\D/g, '').includes(normalizedSearchTerm.replace(/\D/g, '')));
    return (
      normalizeString(client.name).includes(normalizedSearchTerm) ||
      (client.nickname &&
        normalizeString(client.nickname).includes(normalizedSearchTerm)) ||
      phoneMatch ||
      normalizeString(client.status).includes(normalizedSearchTerm)
    );
  });

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };
  
  const handleEditOpen = () => {
    setIsDetailsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedClient(null);
    setIsFormOpen(false);
  };

  const handleDeleteRequest = () => {
    if (selectedClient) {
      setClientToDelete(selectedClient);
    }
    setIsDetailsModalOpen(false);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
    }
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
  };

  const getStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'inactive';
      case 'Expired':
        return 'destructive';
      case 'Test':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline">
                    <TestTube className="mr-2 h-5 w-5" />
                    {t('testButtonLabel')}
                    <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsTestModalOpen(true)}>
                    {t('addTest')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/clients/tests')}>
                    {t('viewTests')}
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => router.push('/clients/new')} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('register')}
          </Button>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchClientPlaceholder')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('clientID')}</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Button variant="outline" className="h-auto font-semibold" onClick={() => handleViewDetails(client)}>
                      {client.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(client.status)}>
                      {t(client.status.toLowerCase() as any)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {client.status === 'Active' ? client.id : ''}
                  </TableCell>
                  <TableCell>
                    {client.expirationDate && client.status === 'Active' ? (
                        <ClientExpiration 
                            clientId={client.id}
                            registeredDate={client.registeredDate} 
                            expirationDate={client.expirationDate} 
                            onExpire={() => updateClient({...client, status: 'Expired'})}
                        />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0">
                          <span className="sr-only">{t('openMenu')}</span>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedClient(client); handleEditOpen(); }}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setClientToDelete(client); setIsDeleteAlertOpen(true); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-lg">
                  {t('noClientsFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedClient && (
        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          client={selectedClient}
          onEdit={handleEditOpen}
          onDelete={handleDeleteRequest}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="h-screen w-screen max-w-none flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">{t('editClient')}</DialogTitle>
            <DialogDescription>{t('editClientDescription')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <ClientForm
              client={selectedClient}
              onSubmitted={handleFormClose}
              onCancel={handleFormClose}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteClientWarning')}{' '}
              <span className="font-semibold">{clientToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </>
  );
}
