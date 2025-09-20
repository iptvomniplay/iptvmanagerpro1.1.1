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
  CreditCard,
  AlertTriangle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { add, isFuture, parseISO } from 'date-fns';


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

  const filteredClients = React.useMemo(() => {
    const normalizedSearchTerm = normalizeString(searchTerm);
    if (!normalizedSearchTerm) {
      return clients;
    }
    return clients.filter((client) => {
      const nameMatch = normalizeString(client.name).includes(normalizedSearchTerm);
      const nicknameMatch = client.nickname && normalizeString(client.nickname).includes(normalizedSearchTerm);
      const phoneMatch = client.phones.some(phone => phone.number.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')));
      const idMatch = client.id && normalizeString(client.id).includes(normalizedSearchTerm);

      return nameMatch || nicknameMatch || phoneMatch || idMatch;
    });
  }, [clients, searchTerm]);

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
      deleteClient(clientToDelete._tempId);
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
  
  const hasPendingApps = (client: Client): boolean => {
    if (client.status !== 'Active' || !client.plans || client.plans.length === 0) {
      return false;
    }
    const totalScreens = client.plans.reduce((sum, plan) => sum + plan.screens, 0);
    const configuredApps = client.applications?.length || 0;
    return configuredApps < totalScreens;
  };
  
  const hasActiveTest = (client: Client): boolean => {
    if (!client.tests || client.tests.length === 0) {
      return false;
    }
    return client.tests.some(test => {
      const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
      return isFuture(expirationDate);
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/subscription')} size="lg" className="flex-1">
              <CreditCard />
              <span className="ml-2">{t('subscription')}</span>
          </Button>
          
          <Button onClick={() => router.push('/clients/tests')} size="lg" className="flex-1">
              <TestTube/>
              <span className="ml-2">{t('testes')}</span>
          </Button>

          <Button onClick={() => router.push('/clients/new')} size="lg" className="flex-1">
              <PlusCircle/>
              <span className="ml-2">{t('register')}</span>
          </Button>
        </div>

        <div className="relative w-full">
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
              <TableHead>{t('clientStatus')}</TableHead>
              <TableHead>{t('expiresIn')}</TableHead>
              <TableHead>{t('clientID')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const latestTest = client.status === 'Test' && client.tests && client.tests.length > 0 
                  ? [...client.tests].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0] 
                  : null;
                
                const clientHasActiveTest = client.status === 'Active' && hasActiveTest(client);

                return (
                  <TableRow key={client._tempId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-auto font-semibold" onClick={() => handleViewDetails(client)}>
                          {client.name}
                        </Button>
                        
                        {clientHasActiveTest && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <TestTube className="h-5 w-5 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('clientWithActiveTest')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {hasPendingApps(client) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('pendingAppsWarning')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(client.status)}>
                        {t(client.status.toLowerCase() as any)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        {client.status === 'Active' && client.plans && client.plans.length > 0 ? (
                            <ClientExpiration
                                key={`${client._tempId}-plan`}
                                clientId={client._tempId}
                                planStartDate={client.registeredDate} 
                                planPeriod={client.plans[0].planPeriod}
                                onExpire={() => updateClient({...client, status: 'Expired'})}
                            />
                        ) : client.status === 'Test' && latestTest ? (
                            <ClientExpiration
                                key={`${client._tempId}-test`}
                                clientId={client._tempId}
                                testCreationDate={latestTest.creationDate}
                                testDurationValue={latestTest.durationValue}
                                testDurationUnit={latestTest.durationUnit}
                                onExpire={() => updateClient({...client, status: 'Expired'})}
                            />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {client.id || t('noId')}
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
                )
              })
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
              {t('deleteClientWarning')} <span className="font-semibold">{clientToDelete?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </>
  );
}
