'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Client, SelectedPlan } from '@/lib/types';
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
import { DollarSign, ArrowDownUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type CashFlowEntry = {
  date: string;
  client: Client;
  description: string;
  amount: number;
  type: 'income' | 'expense';
};

export default function FinancialPage() {
  const { t, language } = useLanguage();
  const { clients, isDataLoaded } = useData();
  const [cashFlowEntries, setCashFlowEntries] = React.useState<CashFlowEntry[]>([]);
  const [totalRevenue, setTotalRevenue] = React.useState(0);

  React.useEffect(() => {
    if (isDataLoaded) {
      const entries = clients
        .filter(client => client.status === 'Active' && client.activationDate && client.plans && client.plans.length > 0)
        .map(client => {
          const totalAmount = client.plans!.reduce((sum, plan) => sum + plan.planValue, 0);
          const description = client.plans!.map(p => p.plan.name).join(', ');
          
          return {
            date: client.activationDate!,
            client: client,
            description: description,
            amount: totalAmount,
            type: 'income' as const,
          };
        })
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

      setCashFlowEntries(entries);
      const revenue = entries.reduce((sum, entry) => sum + entry.amount, 0);
      setTotalRevenue(revenue);
    }
  }, [clients, isDataLoaded]);
  
  const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('financial')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('cashFlowDescription')}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRevenue', { 'pt-BR': 'Receita Total' })}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('transactions', { 'pt-BR': 'Transações' })}</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashFlowEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cashFlow')}</CardTitle>
          <CardDescription>{t('cashFlowEntriesDescription', { 'pt-BR': 'Visualize todas as entradas e saídas de caixa.' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('client')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead className="text-right">{t('value')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowEntries.length > 0 ? (
                  cashFlowEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(parseISO(entry.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-medium">{entry.client.name}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={entry.type === 'income' ? 'success' : 'destructive'}>
                          {formatCurrency(entry.amount)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t('noTransactionsFound', { 'pt-BR': 'Nenhuma transação encontrada.' })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
