'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Server, Transaction } from '@/lib/types';
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
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TransactionModal } from './components/transaction-modal';

export default function StockPage() {
  const { t } = useLanguage();
  const { servers, addTransactionToServer } = useData();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedServer, setSelectedServer] = React.useState<Server | null>(null);

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
          <CardContent>
            <div className="rounded-xl border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('serverName')}</TableHead>
                    <TableHead>{t('paymentMethod')}</TableHead>
                    <TableHead>{t('creditBalance')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>
                        <Badge variant={server.paymentType === 'prepaid' ? 'default' : 'info'}>
                          {t(server.paymentType as any)}
                        </Badge>
                      </TableCell>
                      <TableCell>{server.creditStock || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" onClick={() => handleOpenModal(server)}>
                            <Settings className="mr-2 h-4 w-4" />
                            {t('manage')}
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
    </>
  );
}
