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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Trash2,
} from 'lucide-react';
import { ClientForm } from './client-form';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';

export default function ClientsPageContent({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const { t } = useLanguage();
  const [clients, setClients] = React.useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingClient, setEditingClient] = React.useState<Client | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(
    null
  );

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter((c) => c.id !== clientToDelete.id));
    }
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
  };

  const handleFormSubmit = (values: Omit<Client, 'id' | 'registeredDate'>) => {
    if (editingClient) {
      setClients(
        clients.map((c) =>
          c.id === editingClient.id ? { ...editingClient, ...values } : c
        )
      );
    } else {
      const newClient: Client = {
        ...values,
        id: `C${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        registeredDate: format(new Date(), 'yyyy-MM-dd'),
      };
      setClients([newClient, ...clients]);
    }
    setIsFormOpen(false);
  };

  const getStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchClientPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddClient}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('registerClient')}
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('clientID')}</TableHead>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('expiryDate')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(client.status)}>
                      {t(client.status.toLowerCase() as any)}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {format(parseISO(client.expiryDate), 'MMMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteConfirm(client)}
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
                <TableCell colSpan={6} className="h-24 text-center">
                  {t('noClientsFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? t('editClient') : t('registerNewClient')}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? t('editClientDescription')
                : t('registerNewClientDescription')}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
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
    </>
  );
}
