
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
import { ArrowUp, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ChevronsUpDown } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { EntryModal } from './components/entry-modal';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type CardVisibilityState = {
  revenue: boolean;
  expense: boolean;
  balance: boolean;
  profit: boolean;
  transactions: boolean;
};

export default function FinancialPage() {
  const { t, language } = useLanguage();
  const { cashFlow, addCashFlowEntry, updateCashFlowEntry, deleteCashFlowEntry } = useData();
  const { financialPeriodFilter, financialTypeFilter } = useDashboardSettings();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<CashFlowEntry | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState<CashFlowEntry | null>(null);

  const [isFinancialDataVisible, setIsFinancialDataVisible] = React.useState(false);
  const [visibleEntries, setVisibleEntries] = React.useState<Set<string>>(new Set());

  const [cardVisibility, setCardVisibility] = React.useState<CardVisibilityState>({
    revenue: false,
    expense: false,
    balance: false,
    profit: false,
    transactions: false,
  });

  const [openCards, setOpenCards] = React.useState({
    revenue: false,
    expense: false,
    balance: false,
    profit: false,
    transactions: false,
  });

  const toggleCardVisibility = (card: keyof CardVisibilityState) => {
    setCardVisibility(prev => ({ ...prev, [card]: !prev[card] }));
  };

  const toggleCardOpen = (card: keyof typeof openCards) => {
    setOpenCards(prev => ({...prev, [card]: !prev[card]}));
  }

  const allEntries = React.useMemo(() => {
    return [...cashFlow].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [cashFlow]);
  
  const entriesForPeriod = React.useMemo(() => {
    const now = new Date();
    let interval: Interval;

    switch (financialPeriodFilter) {
      case 'daily':
        interval = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case 'monthly':
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'yearly':
        interval = { start: startOfYear(now), end: endOfYear(now) };
        break;
      default:
        interval = { start: new Date(0), end: now };
    }

    return allEntries.filter(entry => isWithinInterval(parseISO(entry.date), interval));
  }, [allEntries, financialPeriodFilter]);


  const filteredEntries = React.useMemo(() => {
    if (financialTypeFilter === 'all') {
      return entriesForPeriod;
    }
    return entriesForPeriod.filter(entry => entry.type === financialTypeFilter);
  }, [entriesForPeriod, financialTypeFilter]);

  const totalRevenue = React.useMemo(() => {
    return entriesForPeriod.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  }, [entriesForPeriod]);

  const totalExpenses = React.useMemo(() => {
    return entriesForPeriod.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  }, [entriesForPeriod]);
  
  const netBalance = totalRevenue - totalExpenses;

  const handleOpenModal = (entry: CashFlowEntry | null = null) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };
  
  const handleSaveEntry = (entry: Omit<CashFlowEntry, 'id' | 'date'> & { id?: string }) => {
    if (entry.id) {
      const existingEntry = cashFlow.find(e => e.id === entry.id);
      if(existingEntry) {
        updateCashFlowEntry({ ...existingEntry, ...entry });
      }
    } else {
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
  
  const formatCurrency = (value: number, isVisible: boolean) => {
    if (!isVisible) return '•••••';
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const toggleEntryVisibility = (entryId: string) => {
    setVisibleEntries(prev => {
        const newSet = new Set(prev);
        if (newSet.has(entryId)) {
            newSet.delete(entryId);
        } else {
            newSet.add(entryId);
        }
        return newSet;
    });
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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Collapsible open={openCards.revenue} onOpenChange={() => toggleCardOpen('revenue')}>
              <Card className="[box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)] h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCardVisibility('revenue'); }}>
                            {isFinancialDataVisible || cardVisibility.revenue ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronsUpDown className="h-4 w-4"/>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue, isFinancialDataVisible || cardVisibility.revenue)}</div>
                    </CardContent>
                  </CollapsibleContent>
              </Card>
            </Collapsible>
            
            <Collapsible open={openCards.expense} onOpenChange={() => toggleCardOpen('expense')}>
              <Card className="[box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)] h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalExpense')}</CardTitle>
                   <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCardVisibility('expense'); }}>
                            {isFinancialDataVisible || cardVisibility.expense ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronsUpDown className="h-4 w-4"/>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses, isFinancialDataVisible || cardVisibility.expense)}</div>
                    </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            
            <Collapsible open={openCards.balance} onOpenChange={() => toggleCardOpen('balance')}>
              <Card className="[box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)] h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('netBalance')}</CardTitle>
                   <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCardVisibility('balance'); }}>
                            {isFinancialDataVisible || cardVisibility.balance ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronsUpDown className="h-4 w-4"/>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                      <div className={cn("text-2xl font-bold", netBalance >= 0 ? "text-foreground" : "text-destructive")}>{formatCurrency(netBalance, isFinancialDataVisible || cardVisibility.balance)}</div>
                    </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

             <Collapsible open={openCards.profit} onOpenChange={() => toggleCardOpen('profit')}>
                <Card className="[box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)] h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCardVisibility('profit'); }}>
                                {isFinancialDataVisible || cardVisibility.profit ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </Button>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ChevronsUpDown className="h-4 w-4"/>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                        <div className={cn("text-2xl font-bold", netBalance >= 0 ? "text-green-500" : "text-destructive")}>{formatCurrency(netBalance, isFinancialDataVisible || cardVisibility.profit)}</div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <Collapsible open={openCards.transactions} onOpenChange={() => toggleCardOpen('transactions')}>
              <Card className="[box-shadow:0_0_23px_0px_rgba(255,255,255,0.6)] h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('transactions')}</CardTitle>
                  <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCardVisibility('transactions'); }}>
                            {isFinancialDataVisible || cardVisibility.transactions ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronsUpDown className="h-4 w-4"/>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isFinancialDataVisible || cardVisibility.transactions ? filteredEntries.length : '•••••'}
                      </div>
                    </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => {
                      const isAutomated = entry.sourceServerId || entry.sourceTransactionId;
                      const isEntryVisible = isFinancialDataVisible || visibleEntries.has(entry.id);
                      return (
                      <TableRow key={entry.id}>
                        <TableCell>{format(parseISO(entry.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={entry.type === 'income' ? 'success' : 'destructive'}>
                            {entry.type === 'expense' && isEntryVisible && '- '}{formatCurrency(entry.amount, isEntryVisible)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleEntryVisibility(entry.id)}>
                                {isEntryVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                               </Button>
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
                            </div>
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
