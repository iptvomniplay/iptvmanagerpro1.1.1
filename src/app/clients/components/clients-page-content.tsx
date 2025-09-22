

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
import { ReportModal, SelectedReportsState, reportConfig, ReportKey } from '@/app/settings/components/report-modal';
import { ReportDisplayModal, GeneratedReportData } from '@/app/settings/components/report-display-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export type ClientFormValues = Omit<Client, 'id' | 'registeredDate'>;

const ClientCard = ({ client, onSelect, ...props }: { client: Client, onSelect: (client: Client) => void, [key: string]: any }) => {
    const { t } = useLanguage();
    const { servers, updateClient } = useData();
    const [glowColor, setGlowColor] = React.useState('transparent');

    React.useEffect(() => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        setGlowColor(randomColor);
    }, []);

    const hasPendingApps = (client: Client): boolean => {
        if (client.status !== 'Active' || !client.plans || client.plans.length === 0) {
            return false;
        }
        const totalScreens = client.plans.reduce((sum, plan) => sum + plan.screens, 0);
        const configuredApps = client.applications?.length || 0;
        return configuredApps < totalScreens;
    };

    const hasOrphanedPlan = (client: Client): boolean => {
        if (!client.plans || client.plans.length === 0) {
            return false;
        }
        const serverIds = servers.map(s => s.id);
        return client.plans.some(plan => !serverIds.includes(plan.panel.id));
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
    
    const getStatusVariant = (status: Client['status']) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Inactive': return 'inactive';
            case 'Expired': return 'destructive';
            case 'Test': return 'warning';
            default: return 'outline';
        }
    };

    const latestTest = client.status === 'Test' && client.tests && client.tests.length > 0
        ? [...client.tests].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0]
        : null;

    return (
        <Card 
            key={client._tempId}
            onClick={() => onSelect(client)}
            className="cursor-pointer hover:border-primary/50 transition-all"
            style={{ boxShadow: `0 0 23px 0px ${glowColor}` }}
            {...props}
        >
            <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {hasOrphanedPlan(client) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                                        <AlertTriangle className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('clientWithInvalidPlan')}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {hasActiveTest(client) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10" onClick={(e) => e.stopPropagation()}>
                                        <TestTube className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('clientWithActiveTest')}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {hasPendingApps(client) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10" onClick={(e) => e.stopPropagation()}>
                                        <AlertTriangle className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('pendingAppsWarning')}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">{t('openMenu')}</span>
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); props.onEdit(client) }}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); props.onGenerateReport(client) }}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('report')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); props.onDelete(client) }} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm p-4 pt-0">
                <div>
                    <p className="text-muted-foreground font-semibold">{t('clientStatus')}</p>
                    <Badge variant={getStatusVariant(client.status)} className="mt-1">
                        {t(client.status.toLowerCase() as any)}
                    </Badge>
                </div>
                <div>
                    <p className="text-muted-foreground font-semibold">{t('clientID')}</p>
                    <p className="font-medium">{client.id || t('noId')}</p>
                </div>
                <div>
                    <p className="text-muted-foreground font-semibold">{t('expiresIn')}</p>
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        {client.status === 'Active' && client.plans && client.plans.length > 0 ? (
                            <ClientExpiration
                                key={`${client._tempId}-plan`}
                                clientId={client._tempId}
                                planStartDate={client.registeredDate}
                                planPeriod={client.plans[0].planPeriod}
                                onExpire={() => updateClient({ ...client, status: 'Expired' })}
                            />
                        ) : client.status === 'Test' && latestTest ? (
                            <ClientExpiration
                                key={`${client._tempId}-test`}
                                clientId={client._tempId}
                                testCreationDate={latestTest.creationDate}
                                testDurationValue={latestTest.durationValue}
                                testDurationUnit={latestTest.durationUnit}
                                onExpire={() => updateClient({ ...client, status: 'Expired' })}
                            />
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


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
  
  const handleEditOpen = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(false); // Close details modal if open
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedClient(null);
    setIsFormOpen(false);
  };

  const handleDeleteRequest = (client: Client) => {
    setClientToDelete(client);
    setIsDetailsModalOpen(false); // Close details modal if open
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete._tempId);
    }
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
  };

  const handleOpenReportModal = (client: Client) => {
    setClientForReport(client);
    setIsReportModalOpen(true);
  };

  const handleGenerateReport = (selectedConfigs: SelectedReportsState, clientContext?: Client | null) => {
    setIsReportModalOpen(false);
    const generatedReports: GeneratedReportData[] = [];
    const reportClients = clientContext ? [clientContext] : clients;

    (Object.keys(selectedConfigs) as ReportKey[]).forEach(reportKey => {
      const config = selectedConfigs[reportKey];
      if (!config) return;
      
      const reportMeta = reportConfig[reportKey];
      let headers: string[] = [];
      let rows: (string | undefined)[][] = [];
      
      if (reportMeta.type === 'fields' && config.all) {
          let selectedFields = (Object.keys((config as any).fields) as (keyof typeof reportMeta.fields)[]).filter(
            fieldKey => (config as any).fields?.[fieldKey]
          );
          
          if (selectedFields.length === 0) return;
          
          if (clientContext) {
            selectedFields = selectedFields.filter(field => field !== 'fullName' && field !== 'clientName');
          }

          headers = selectedFields.map(fieldKey => t(reportMeta.fields[fieldKey as keyof typeof reportMeta.fields]));

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
                              case 'panel': return client.plans?.map(p => p.panel.name).join(', ');
                              case 'server': return client.plans?.map(p => p.server.name).join(', ');
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
                  ).filter(({ test, client }) => {
                       const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
                       const isInterrupted = client.status === 'Inactive' && isFuture(expirationDate);
                       return isFuture(expirationDate) && !isInterrupted;
                  });
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
                case 'creditBalance':
                    rows = servers.map(server =>
                        selectedFields.map(field => {
                            switch (field) {
                                case 'panelName': return server.name;
                                case 'currentBalance': return String(server.creditStock || 0);
                                case 'paymentMethod': return t(server.paymentType as any);
                                default: return '';
                            }
                        })
                    );
                    break;
          }
      } else if (reportMeta.type === 'statistic' && config.all) {
          switch(reportKey) {
            case 'panelUsage': {
                  headers = [t('serverName'), t('report_usagePercentage')];
                  const allPlans = clients.flatMap(c => c.plans || []);
                  if (allPlans.length > 0) {
                      const panelUsage: Record<string, number> = {};
                      allPlans.forEach(plan => {
                          panelUsage[plan.panel.name] = (panelUsage[plan.panel.name] || 0) + 1;
                      });
                      rows = Object.entries(panelUsage)
                          .map(([panelName, count]) => [panelName, `${((count / allPlans.length) * 100).toFixed(2)}%`])
                          .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
                  }
                  break;
              }
            case 'subServerUsage': {
                headers = [t('serverName'), t('report_usagePercentage')];
                const allPlans = clients.flatMap(c => c.plans || []);
                if (allPlans.length > 0) {
                    const serverUsage: Record<string, number> = {};
                    allPlans.forEach(plan => {
                        serverUsage[plan.server.name] = (serverUsage[plan.server.name] || 0) + 1;
                    });
                    rows = Object.entries(serverUsage)
                        .map(([serverName, count]) => [serverName, `${((count / allPlans.length) * 100).toFixed(2)}%`])
                        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
                }
                break;
            }
          }
      }
      
      if(rows.length > 0) {
        generatedReports.push({ title: t(reportMeta.label as any), headers, rows });
      }
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

      <div className="space-y-4 mt-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <ClientCard
                key={client._tempId}
                client={client}
                onSelect={handleViewDetails}
                onEdit={handleEditOpen}
                onDelete={handleDeleteRequest}
                onGenerateReport={handleOpenReportModal}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold">{t('noClientsFound')}</h3>
          </div>
        )}
      </div>

      {selectedClient && (
        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          client={selectedClient}
          onEdit={() => handleEditOpen(selectedClient)}
          onDelete={() => handleDeleteRequest(selectedClient)}
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
        initialClientContext={clientForReport}
      />
      <ReportDisplayModal
        isOpen={isReportDisplayModalOpen}
        onClose={() => setIsReportDisplayModalOpen(false)}
      />
    </>
  );
}

    