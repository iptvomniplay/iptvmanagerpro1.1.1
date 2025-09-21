'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Client, CashFlowEntry } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowDownUp, ArrowUp, ArrowDown, Landmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { EntryModal } from './components/entry-modal';

export default function FinancialPage() {
  const { t, language } = useLanguage();
  const { cashFlow, addCashFlowEntry } = useData();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<'income' | 'expense'>('income');

  const allEntries = React.useMemo(() => {
    return [...cashFlow].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [cashFlow]);

  const totalRevenue = React.useMemo(() => {
    return allEntries.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  }, [allEntries]);

  const totalExpenses = React.useMemo(() => {
    return allEntries.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  }, [allEntries]);
  
  const netBalance = totalRevenue - totalExpenses;

  const handleOpenModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const handleSaveEntry = (entry: Omit<CashFlowEntry, 'id' | 'date'>) => {
    addCashFlowEntry(entry);
    setIsModalOpen(false);
  };
  
  const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('financial')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t('cashFlowDescription')}
          </p>
        </div>

        <div className="flex gap-4">
            <Button size="lg" onClick={() => handleOpenModal('income')}>
                <ArrowUp className="mr-2 h-5 w-5" />
                {t('addIncome')}
            </Button>
            <Button size="lg" variant="destructive" onClick={() => handleOpenModal('expense')}>
                <ArrowDown className="mr-2 h-5 w-5" />
                {t('addExpense')}
            </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalExpense')}</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('netBalance')}</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('transactions')}</CardTitle>
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allEntries.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('cashFlow')}</CardTitle>
            <CardDescription>{t('cashFlowEntriesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead className="text-right">{t('value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.length > 0 ? (
                    allEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(parseISO(entry.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={entry.type === 'income' ? 'success' : 'destructive'}>
                            {entry.type === 'expense' && '- '}{formatCurrency(entry.amount)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        {t('noTransactionsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <EntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        type={modalType}
      />
    </>
  );
}
