
'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestModal } from '../components/test-modal';
import { useData } from '@/hooks/use-data';
import type { Client, Test, Server as ServerType } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientExpiration } from '../components/client-expiration';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { normalizeString } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientDetailsModal } from '../components/client-details-modal';
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
import { add, isFuture, parseISO } from 'date-fns';

type ClientWithTest = {
  client: Client;
  test: Test;
  panel?: ServerType;
}

const TestList = ({ tests, onUpdateClient, onViewDetails, isExpiredList, onUpdateTest }: { tests: ClientWithTest[], onUpdateClient: (client: Client) => void, onViewDetails: (client: Client) => void, isExpiredList?: boolean, onUpdateTest: (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => void }) => {
    const { t } = useLanguage();

    const handleInterruptTest = (client: Client, test: Test) => {
        if (client.status === 'Test') {
            onUpdateClient({ ...client, status: 'Inactive' });
        } else if (client.status === 'Active') {
            onUpdateTest(client._tempId, test.creationDate, { durationValue: 0 });
        }
    }

    if (tests.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>{t('noTestsFound')}</p>
            </div>
        );
    }
    
    return (
        <div className="rounded-xl border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('client')}</TableHead>
                        <TableHead>{t('panel')}/{t('servers')}</TableHead>
                        <TableHead>{t('testPackage')}</TableHead>
                        <TableHead>{t('expiresIn')}</TableHead>
                        {!isExpiredList && <TableHead className="text-right">{t('actions')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map(({ client, test, panel }) => (
                        <TableRow key={`${client._tempId}-${test.creationDate}`} onClick={() => onViewDetails(client)} className="cursor-pointer">
                            <TableCell className="font-semibold text-primary">
                                {client.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className="text-base">{panel?.name || test.panelId}</Badge>
                                <Badge variant="outline" className="text-base">{test.subServerName}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                               <Badge variant="outline">{test.package}</Badge>
                            </TableCell>
                            <TableCell>
                                <div onClick={(e) => e.stopPropagation()}>
                                    {isFuture(add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue })) && client.status !== 'Inactive' ? (
                                        <ClientExpiration
                                            key={`${client._tempId}-test-list`}
                                            clientId={client._tempId}
                                            testCreationDate={test.creationDate}
                                            testDurationValue={test.durationValue}
                                            testDurationUnit={test.durationUnit}
                                            onExpire={() => onUpdateClient({...client, status: 'Expired'})}
                                        />
                                    ) : (
                                        <Badge variant="destructive">{t('expired')}</Badge>
                                    )}
                                </div>
                            </TableCell>
                             {!isExpiredList && (
                                <TableCell className="text-right">
                                  {isFuture(add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue })) && (
                                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleInterruptTest(client, test);}}>
                                        {t('interruptTest')}
                                    </Button>
                                  )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};


export default function ViewTestsPage() {
  const { t } = useLanguage();
  const { clients, servers, updateClient, deleteClient, updateTestInClient } = useData();
  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('inProgress');
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  const allClientTests = React.useMemo(() => {
    return clients.flatMap(client => 
        (client.tests || []).map(test => ({
            client: client,
            test: test,
            panel: servers.find(s => s.id === test.panelId)
        }))
    ).sort((a, b) => new Date(b.test.creationDate).getTime() - new Date(a.test.creationDate).getTime());
  }, [clients, servers]);

  const testsInProgress: ClientWithTest[] = React.useMemo(() => {
    const tests = allClientTests.filter(({ client, test }) => {
      const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
      const isInterrupted = client.status === 'Inactive' && isFuture(expirationDate);
      return isFuture(expirationDate) && !isInterrupted;
    });

    if (!searchTerm) return tests;
    const normalizedSearchTerm = normalizeString(searchTerm);
    return tests.filter(({ client }) => normalizeString(client.name).includes(normalizedSearchTerm));
  }, [allClientTests, searchTerm]);

  const expiredTests: ClientWithTest[] = React.useMemo(() => {
    const tests = allClientTests.filter(({ client, test }) => {
      const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
      const isInterrupted = client.status === 'Inactive' && isFuture(expirationDate);
      return !isFuture(expirationDate) || isInterrupted;
    });

    if (!searchTerm) return tests;
    const normalizedSearchTerm = normalizeString(searchTerm);
    return tests.filter(({ client }) => normalizeString(client.name).includes(normalizedSearchTerm));
  }, [allClientTests, searchTerm]);
  
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteRequest = () => {
    if (selectedClient) {
      setIsDetailsModalOpen(false);
      setIsDeleteAlertOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedClient) {
      deleteClient(selectedClient._tempId);
    }
    setIsDeleteAlertOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('testes')}</CardTitle>
          <CardDescription>
            {t('testManagementDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => setIsTestModalOpen(true)} size="lg">
            {t('addTest')}
          </Button>
        </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle>{t('statusDosTestes')}</CardTitle>
              <CardDescription>
                {activeTab === 'inProgress' ? t('testsInProgress') : t('testsConducted')}
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="inProgress">{t('testsInProgress')}</TabsTrigger>
                      <TabsTrigger value="expired">{t('expiredTests')}</TabsTrigger>
                  </TabsList>
                  <div className="relative w-full max-w-sm mt-4">
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
                  <TabsContent value="inProgress" className="mt-4">
                      <TestList tests={testsInProgress} onUpdateClient={updateClient} onViewDetails={handleViewDetails} onUpdateTest={updateTestInClient} />
                  </TabsContent>
                  <TabsContent value="expired" className="mt-4">
                      <TestList tests={expiredTests} onUpdateClient={updateClient} onViewDetails={handleViewDetails} isExpiredList={true} onUpdateTest={updateTestInClient} />
                  </TabsContent>
              </Tabs>
          </CardContent>
      </Card>
      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
      
       {selectedClient && (
        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          client={selectedClient}
          onEdit={() => {}}
          onDelete={handleDeleteRequest}
          isReadOnly={true}
        />
      )}
      
      {selectedClient && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">{t('areYouSure')}</AlertDialogTitle>
                <AlertDialogDescription>
                {t('deleteClientWarning')} <span className="font-semibold">{selectedClient?.name}</span>?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
