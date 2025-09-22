
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowDownUp, ArrowUp, ArrowDown, Landmark, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { EntryModal } from './components/entry-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinancialPage() {
  const { t, language } = useLanguage();
  const { cashFlow, addCashFlowEntry, updateCashFlowEntry, deleteCashFlowEntry } = useData();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<CashFlowEntry | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState<CashFlowEntry | null>(null);

  const [filter, setFilter] = React.useState<'all' | 'income' | 'expense'>('all');
  const [isFinancialDataVisible, setIsFinancialDataVisible] = React.useState(false);

  const allEntries = React.useMemo(() => {
    return [...cashFlow].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [cashFlow]);

  const filteredEntries = React.useMemo(() => {
    if (filter === 'all') {
      return allEntries;
    }
    return allEntries.filter(entry => entry.type === filter);
  }, [allEntries, filter]);

  const totalRevenue = React.useMemo(() => {
    return allEntries.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  }, [allEntries]);

  const totalExpenses = React.useMemo(() => {
    return allEntries.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  }, [allEntries]);
  
  const netBalance = totalRevenue - totalExpenses;

  const handleOpenModal = (entry: CashFlowEntry | null = null) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };
  
  const handleSaveEntry = (entry: Omit<CashFlowEntry, 'id' | 'date'> & { id?: string }) => {
    if (entry.id) {
      // Update existing entry
      const existingEntry = cashFlow.find(e => e.id === entry.id);
      if(existingEntry) {
        updateCashFlowEntry({ ...existingEntry, ...entry });
      }
    } else {
      // Add new entry
      addCashFlowEntry(entry);
    }
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteRequest = (entry: CashFlowEntry) => {
    setEntryToDelete(entry);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      deleteCashFlowEntry(entryToDelete.id);
      setIsDeleteAlertOpen(false);
      setEntryToDelete(null);
    }
  };
  
  const formatCurrency = (value: number) => {
    if (!isFinancialDataVisible) return '•••••';
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
            <Button size="lg" onClick={() => handleOpenModal()}>
                <ArrowUp className="mr-2 h-5 w-5" />
                {t('addIncome')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsFinancialDataVisible(prev => !prev)}
            >
              {isFinancialDataVisible ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
              {isFinancialDataVisible ? t('hideValues') : t('showValues')}
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
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="all">{t('all')}</TabsTrigger>
                    <TabsTrigger value="income">{t('income')}</TabsTrigger>
                    <TabsTrigger value="expense">{t('expense')}</TabsTrigger>
                </TabsList>
                <div className="rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('description')}</TableHead>
                        <TableHead className="text-right">{t('value')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry) => {
                          const isAutomated = entry.sourceServerId || entry.sourceTransactionId;
                          return (
                          <TableRow key={entry.id}>
                            <TableCell>{format(parseISO(entry.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="font-medium">{entry.description}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={entry.type === 'income' ? 'success' : 'destructive'}>
                                {entry.type === 'expense' && isFinancialDataVisible && '- '}{formatCurrency(entry.amount)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">{t('openMenu')}</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenModal(entry)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      {t('edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRequest(entry)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )})
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            {t('noTransactionsFound')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <EntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        entry={editingEntry}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteEntryWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
