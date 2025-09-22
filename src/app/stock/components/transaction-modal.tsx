
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import type { Server, Transaction, TransactionType } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, History, RotateCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CreditPurchaseModal } from './credit-purchase-modal';
import { ManualAdjustmentModal } from './manual-adjustment-modal';
import { useData } from '@/hooks/use-data';


interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export function TransactionModal({ isOpen, onClose, server: initialServer, onAddTransaction }: TransactionModalProps) {
  const { t, language } = useLanguage();
  const { servers } = useData();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = React.useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = React.useState(false);
  const [isReversalAlertOpen, setIsReversalAlertOpen] = React.useState(false);
  const [transactionToReverse, setTransactionToReverse] = React.useState<Transaction | null>(null);

  const server = servers.find(s => s.id === initialServer.id) || initialServer;

  const transactions = [...(server.transactions || [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const handlePurchaseConfirm = (quantity: number, totalValue: number) => {
    const unitValue = totalValue / quantity;
    const transaction: Omit<Transaction, 'id' | 'date'> = {
      type: 'purchase',
      credits: quantity,
      totalValue,
      unitValue,
      description: t('creditPurchaseDescription', { quantity }),
    };
    onAddTransaction(transaction);
    setIsPurchaseModalOpen(false);
  };
  
  const handleAdjustmentConfirm = (quantity: number, description: string) => {
    const transaction: Omit<Transaction, 'id' | 'date'> = {
      type: 'adjustment',
      credits: quantity,
      totalValue: 0,
      unitValue: 0,
      description: description,
    };
    onAddTransaction(transaction);
    setIsAdjustmentModalOpen(false);
  };
  
  const handleReversalRequest = (transaction: Transaction) => {
    setTransactionToReverse(transaction);
    setIsReversalAlertOpen(true);
  }

  const handleReversalConfirm = () => {
    if (!transactionToReverse) return;
    
    const reversalTransaction: Omit<Transaction, 'id' | 'date'> = {
      type: 'reversal',
      credits: -transactionToReverse.credits,
      totalValue: transactionToReverse.totalValue !== 0 ? -transactionToReverse.totalValue : 0,
      unitValue: transactionToReverse.unitValue,
      description: t('reversalOfPurchase', { id: transactionToReverse.id.substring(0, 8)})
    };

    onAddTransaction(reversalTransaction);
    setTransactionToReverse(null);
    setIsReversalAlertOpen(false);
  };

  const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const getTransactionTypeInfo = (type: TransactionType) => {
    switch (type) {
      case 'purchase':
        return { text: t('purchase'), color: 'text-green-500', icon: <PlusCircle className="h-4 w-4" /> };
      case 'consumption':
        return { text: t('consumption'), color: 'text-red-500', icon: <MinusCircle className="h-4 w-4" /> };
      case 'reversal':
        return { text: t('reversal'), color: 'text-yellow-500', icon: <RotateCcw className="h-4 w-4" /> };
      case 'adjustment':
        return { text: t('adjustment'), color: 'text-blue-500', icon: <History className="h-4 w-4" /> };
      default:
        return { text: t(type), color: '', icon: null };
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('stockManagementFor')} {server.name}</DialogTitle>
            <DialogDescription>{t('viewAndManageTransactions')}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center p-4 rounded-lg">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('creditBalance')}</p>
                <p className="text-3xl font-bold">{server.creditStock}</p>
             </div>
             <div className="flex gap-2">
                <Button onClick={() => setIsAdjustmentModalOpen(true)} variant="outline">
                    <History className="mr-2 h-4 w-4"/>
                    {t('manualAdjustment')}
                </Button>
                <Button onClick={() => setIsPurchaseModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    {t('addPurchase')}
                </Button>
             </div>
          </div>
          
          <ScrollArea className="flex-1 border rounded-lg">
             <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead className="text-right">{t('credits')}</TableHead>
                    <TableHead className="text-right">{t('unitValue')}</TableHead>
                    <TableHead className="text-right">{t('total')}</TableHead>
                    <TableHead className="text-center">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const typeInfo = getTransactionTypeInfo(tx.type);
                      const isPositive = tx.credits > 0;
                      return (
                        <TableRow key={tx.id}>
                          <TableCell>{format(parseISO(tx.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <div className={cn("flex items-center gap-2 font-semibold", typeInfo.color)}>
                              {typeInfo.icon}
                              {typeInfo.text}
                            </div>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell className={cn("text-right font-bold", isPositive ? "text-green-500" : "text-red-500")}>
                            {isPositive ? '+' : ''}{tx.credits}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(tx.unitValue)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(tx.totalValue)}</TableCell>
                          <TableCell className="text-center">
                            {tx.type === 'purchase' && (
                               <Button variant="destructive" size="sm" onClick={() => handleReversalRequest(tx)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  {t('reversal')}
                               </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {t('noTransactionsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isPurchaseModalOpen && (
        <CreditPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onConfirm={handlePurchaseConfirm}
          serverName={server.name}
        />
      )}

      {isAdjustmentModalOpen && (
        <ManualAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
          onConfirm={handleAdjustmentConfirm}
        />
      )}
      
      {transactionToReverse && (
        <AlertDialog open={isReversalAlertOpen} onOpenChange={setIsReversalAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('reversalConfirmation', { 
                            credits: transactionToReverse.credits, 
                            value: formatCurrency(transactionToReverse.totalValue) 
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('no')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReversalConfirm}>{t('yes')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

    </>
  );
}
