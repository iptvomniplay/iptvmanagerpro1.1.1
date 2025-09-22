'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Server, Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
          <CardContent className="space-y-4">
            {servers.map((server) => (
                <Card 
                    key={server.id}
                    onClick={() => handleOpenModal(server)}
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    style={{ boxShadow: '0 0 23px 0px rgba(255,255,255,0.6)' }}
                >
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                        <CardTitle className="text-base">{server.name}</CardTitle>
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
                     <CardFooter className="p-4 pt-0">
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenModal(server); }} className="w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            {t('manage')}
                        </Button>
                    </CardFooter>
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
    </>
  );
}
