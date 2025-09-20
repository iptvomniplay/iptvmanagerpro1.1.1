'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TestModal } from '../components/test-modal';
import { useData } from '@/hooks/use-data';
import type { Client, Test, Server as ServerType } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientExpiration } from '../components/client-expiration';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { normalizeString } from '@/lib/utils';

type ClientWithTest = {
  client: Client;
  test: Test;
  panel?: ServerType;
}

export default function ViewTestsPage() {
  const { t } = useLanguage();
  const { clients, servers, updateClient } = useData();
  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const testsInProgress: ClientWithTest[] = React.useMemo(() => {
    const tests = clients
      .filter(client => client.status === 'Test' && client.tests && client.tests.length > 0)
      .map(client => {
        const latestTest = [...client.tests!].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
        const panelForTest = servers.find(s => s.id === latestTest.panelId);
        return { client, test: latestTest, panel: panelForTest };
      });
      
    if (!searchTerm) {
      return tests;
    }

    const normalizedSearchTerm = normalizeString(searchTerm);
    return tests.filter(({ client }) => 
      normalizeString(client.name).includes(normalizedSearchTerm)
    );

  }, [clients, servers, searchTerm]);

  return (
    <>
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
            <CardTitle>{t('viewAllTests')}</CardTitle>
            <CardDescription>{t('testsInProgress')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full max-w-sm">
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
            {testsInProgress.length > 0 ? (
                <div className="rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('client')}</TableHead>
                                <TableHead>{t('panel')}/{t('servers')}</TableHead>
                                <TableHead>{t('testPackage')}</TableHead>
                                <TableHead>{t('expiresIn')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testsInProgress.map(({ client, test, panel }) => (
                                <TableRow key={client._tempId}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
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
                                        <ClientExpiration
                                            key={`${client._tempId}-test-list`}
                                            clientId={client._tempId}
                                            testCreationDate={test.creationDate}
                                            testDurationValue={test.durationValue}
                                            testDurationUnit={test.durationUnit}
                                            onExpire={() => updateClient({...client, status: 'Expired'})}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                  <p>{t('noTestsInProgress')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </>
  );
}
