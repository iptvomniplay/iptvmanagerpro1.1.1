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
  FileText,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { add, isFuture, parseISO, format } from 'date-fns';
import { ReportModal, SelectedReportsState, reportConfig, ReportKey, FieldKey } from '@/app/settings/components/report-modal';
import { ReportDisplayModal, GeneratedReportData } from '@/app/settings/components/report-display-modal';


export type ClientFormValues = Omit<Client, 'id' | 'registeredDate'>;

export default function ClientsPageContent() {
  const { t } = useLanguage();
  const { clients, servers, deleteClient, updateClient } = useData();
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
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isReportDisplayModalOpen, setIsReportDisplayModalOpen] = React.useState(false);
  const [clientForReport, setClientForReport] = React.useState<Client | null>(null);

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

  const handleOpenReportModal = (client: Client) => {
    setClientForReport(client);
    setIsReportModalOpen(true);
  };

  const handleGenerateReport = (selectedConfigs: SelectedReportsState) => {
    setIsReportModalOpen(false);
    if (!clientForReport) return;

    const reportClients = [clientForReport];
    const generatedReports: GeneratedReportData[] = [];

    (Object.keys(selectedConfigs) as ReportKey[]).forEach(reportKey => {
      const config = selectedConfigs[reportKey];
      if (!config || !config.fields) return;

      const reportMeta = reportConfig[reportKey];
      
      const selectedFields = (Object.keys(config.fields) as FieldKey<typeof reportKey>[]).filter(
        fieldKey => config.fields?.[fieldKey as FieldKey<typeof reportKey>]
      );
      
      if (selectedFields.length === 0) return;

      let headers = selectedFields.map(fieldKey => t(reportMeta.fields[fieldKey as keyof typeof reportMeta.fields]));
      let rows: (string | undefined)[][] = [];
      
      switch (reportKey) {
          case 'clientList':
              rows = reportClients.map(client =>
                  selectedFields.map(field => {
                      switch (field) {
                          case 'fullName': return client.name;
                          case 'clientId': return client.id || t('noId');
                          case 'status': return t(client.status.toLowerCase());
                          case 'registeredDate': return client.registeredDate ? format(new Date(client.registeredDate), 'dd/MM/yyyy') : '';
                          case 'contact': return client.phones.map(p => p.number).join(', ');
                          case 'numberOfTests': return String(client.tests?.length || 0);
                          default: return '';
                      }
                  })
              );
              break;
          case 'expiredSubscriptions':
              const expiredClients = reportClients.filter(c => c.status === 'Expired');
              rows = expiredClients.map(client =>
                  selectedFields.map(field => {
                      const lastPlan = client.plans && client.plans.length > 0 ? client.plans[client.plans.length - 1] : null;
                      switch (field) {
                          case 'fullName': return client.name;
                          case 'lastPlan': return lastPlan?.plan.name || 'N/A';
                          case 'expirationDate': return client.expirationDate ? format(new Date(client.expirationDate), 'dd/MM/yyyy') : 'N/A';
                          case 'contact': return client.phones.map(p => p.number).join(', ');
                          default: return '';
                      }
                  })
              );
              break;
          case 'activeTests':
               const allTests = reportClients.flatMap(client =>
                  (client.tests || []).map(test => ({ client, test }))
              );
              rows = allTests.map(({ client, test }) =>
                  selectedFields.map(field => {
                      switch (field) {
                          case 'clientName': return client.name;
                          case 'testPackage': return test.package;
                          case 'startTime': return format(new Date(test.creationDate), 'dd/MM/yyyy HH:mm');
                          case 'endTime':
                              const expiration = add(new Date(test.creationDate), { [test.durationUnit]: test.durationValue });
                              return format(expiration, 'dd/MM/yyyy HH:mm');
                          default: return '';
                      }
                  })
              );
              break;
      }
      
      generatedReports.push({ title: t(reportMeta.label as any), headers, rows });
    });
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('generatedReportData', JSON.stringify(generatedReports));
    }

    setIsReportDisplayModalOpen(true);
    setClientForReport(null);
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
                                 <Badge variant="warning" className="text-base">
                                    <TestTube className="h-4 w-4 mr-1" />
                                    {t('test')}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('clientWithActiveTest')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {hasPendingApps(client) && (
                          <Popover>
                            <PopoverTrigger>
                              <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto max-w-xs">
                              <p>{t('pendingAppsWarning')}</p>
                            </PopoverContent>
                          </Popover>
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
                          <DropdownMenuItem onClick={() => handleOpenReportModal(client)}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('report')}
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

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        clientContext={clientForReport}
      />
      <ReportDisplayModal
        isOpen={isReportDisplayModalOpen}
        onClose={() => setIsReportDisplayModalOpen(false)}
      />
    </>
  );
}
