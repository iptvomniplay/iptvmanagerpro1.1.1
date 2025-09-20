'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TestModal } from '../components/test-modal';
import { useData } from '@/hooks/use-data';
import type { Client, Test } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientExpiration } from '../components/client-expiration';
import { Badge } from '@/components/ui/badge';

type ClientWithTest = {
  client: Client;
  test: Test;
}

export default function ViewTestsPage() {
  const { t } = useLanguage();
  const { clients, updateClient } = useData();
  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);

  const testsInProgress: ClientWithTest[] = React.useMemo(() => {
    return clients
      .filter(client => client.status === 'Test' && client.tests && client.tests.length > 0)
      .map(client => {
        const latestTest = [...client.tests!].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
        return { client, test: latestTest };
      });
  }, [clients]);

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
          <CardContent>
            {testsInProgress.length > 0 ? (
                <div className="rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('client')}</TableHead>
                                <TableHead>{t('panel')}</TableHead>
                                <TableHead>{t('testPackage')}</TableHead>
                                <TableHead>{t('expiresIn')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testsInProgress.map(({ client, test }) => (
                                <TableRow key={client._tempId}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">{test.panelId}</Badge>
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
