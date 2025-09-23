

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDashboardSettings, DashboardPeriod, FinancialPeriodFilter, FinancialTypeFilter } from '@/hooks/use-dashboard-settings';
import { ReportModal, SelectedReportsState, reportConfig, ReportKey } from './components/report-modal';
import { ReportDisplayModal, GeneratedReportData } from './components/report-display-modal';
import { useData } from '@/hooks/use-data';
import { add, format, isFuture, parseISO } from 'date-fns';
import type { Client } from '@/lib/types';
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


export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { clients, servers, exportData, importData } = useData();

  const [mounted, setMounted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportDisplayModalOpen, setIsReportDisplayModalOpen] = useState(false);
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    newSubscriptionsPeriod, setNewSubscriptionsPeriod, 
    expirationWarningDays, setExpirationWarningDays,
    financialPeriodFilter, setFinancialPeriodFilter,
    financialTypeFilter, setFinancialTypeFilter
  } = useDashboardSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: 'pt-BR' | 'en-US') => {
    setLanguage(lang);
  };
  
  const handleWarningDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
        value = 1;
    } else if (value < 1) {
        value = 1;
    } else if (value > 30) {
        value = 30;
    }
    setExpirationWarningDays(value);
  }
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setIsImportAlertOpen(true);
    }
  };

  const handleConfirmImport = () => {
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0) {
        const file = fileInputRef.current.files[0];
        importData(file);
    }
    setIsImportAlertOpen(false);
  };
  
  const handleGenerateReport = (selectedConfigs: SelectedReportsState, clientContext?: Client | null) => {
    setIsReportModalOpen(false);
    const generatedReports: GeneratedReportData[] = [];
    const reportClients = clientContext ? [clientContext] : clients;

    (Object.keys(selectedConfigs) as ReportKey[]).forEach(reportKey => {
      const config = selectedConfigs[reportKey];
      if (!config) return;
      
      const reportMeta = reportConfig[reportKey];
      let headers: string[] = [];
      let rows: (string | undefined)[][] = [];
      
      if (reportMeta.type === 'fields' && config.all) {
          let selectedFields = (Object.keys((config as any).fields) as (keyof typeof reportMeta.fields)[]).filter(
            fieldKey => (config as any).fields?.[fieldKey]
          );
          
          if (selectedFields.length === 0) return;
          
          if (clientContext) {
            selectedFields = selectedFields.filter(field => field !== 'fullName' && field !== 'clientName');
          }

          headers = selectedFields.map(fieldKey => t(reportMeta.fields[fieldKey as keyof typeof reportMeta.fields]));

          switch (reportKey) {
              case 'clientList':
                  rows = reportClients.map(client =>
                      selectedFields.map(field => {
                          switch (field) {
                              case 'fullName': return client.name;
                              case 'clientId': return client.id || t('noId');
                              case 'status': return t(client.status.toLowerCase());
                              case 'registeredDate': return client.registeredDate ? format(new Date(client.registeredDate), 'dd/MM/yyyy') : '';
                              case 'contact': return client.phones.map(p => p.number).join(', ');
                              case 'panel': return client.plans?.map(p => p.panel.name).join(', ');
                              case 'server': return client.plans?.map(p => p.server.name).join(', ');
                              case 'numberOfTests': return String(client.tests?.length || 0);
                              default: return '';
                          }
                      })
                  );
                  break;
              case 'expiredSubscriptions':
                  const expiredClients = reportClients.filter(c => c.status === 'Expired');
                  rows = expiredClients.map(client =>
                      selectedFields.map(field => {
                          const lastPlan = client.plans && client.plans.length > 0 ? client.plans[client.plans.length - 1] : null;
                          switch (field) {
                              case 'fullName': return client.name;
                              case 'lastPlan': return lastPlan?.plan.name || 'N/A';
                              case 'expirationDate': return client.expirationDate ? format(new Date(client.expirationDate), 'dd/MM/yyyy') : 'N/A';
                              case 'contact': return client.phones.map(p => p.number).join(', ');
                              default: return '';
                          }
                      })
                  );
                  break;
              case 'activeTests':
                   const allTests = reportClients.flatMap(client =>
                      (client.tests || []).map(test => ({ client, test }))
                  ).filter(({ test, client }) => {
                       const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
                       const isInterrupted = client.status === 'Inactive' && isFuture(expirationDate);
                       return isFuture(expirationDate) && !isInterrupted;
                  });
                  rows = allTests.map(({ client, test }) =>
                      selectedFields.map(field => {
                          switch (field) {
                              case 'clientName': return client.name;
                              case 'testPackage': return test.package;
                              case 'startTime': return format(new Date(test.creationDate), 'dd/MM/yyyy HH:mm');
                              case 'endTime':
                                  const expiration = add(new Date(test.creationDate), { [test.durationUnit]: test.durationValue });
                                  return format(expiration, 'dd/MM/yyyy HH:mm');
                              default: return '';
                          }
                      })
                  );
                  break;
              case 'creditBalance':
                  rows = servers.map(server =>
                      selectedFields.map(field => {
                          switch (field) {
                              case 'panelName': return server.name;
                              case 'currentBalance': return String(server.creditStock || 0);
                              case 'paymentMethod': return t(server.paymentType as any);
                              default: return '';
                          }
                      })
                  );
                  break;
          }
      } else if (reportMeta.type === 'statistic' && config.all) {
          switch(reportKey) {
            case 'panelUsage': {
                  headers = [t('serverName'), t('report_usagePercentage')];
                  const allPlans = clients.flatMap(c => c.plans || []);
                  if (allPlans.length > 0) {
                      const panelUsage: Record<string, number> = {};
                      allPlans.forEach(plan => {
                          panelUsage[plan.panel.name] = (panelUsage[plan.panel.name] || 0) + 1;
                      });
                      rows = Object.entries(panelUsage)
                          .map(([panelName, count]) => [panelName, `${((count / allPlans.length) * 100).toFixed(2)}%`])
                          .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
                  }
                  break;
              }
            case 'subServerUsage': {
                headers = [t('serverName'), t('report_usagePercentage')];
                const allPlans = clients.flatMap(c => c.plans || []);
                if (allPlans.length > 0) {
                    const serverUsage: Record<string, number> = {};
                    allPlans.forEach(plan => {
                        serverUsage[plan.server.name] = (serverUsage[plan.server.name] || 0) + 1;
                    });
                    rows = Object.entries(serverUsage)
                        .map(([serverName, count]) => [serverName, `${((count / allPlans.length) * 100).toFixed(2)}%`])
                        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
                }
                break;
            }
          }
      }
      
      if(rows.length > 0) {
        generatedReports.push({ title: t(reportMeta.label as any), headers, rows });
      }
    });
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('generatedReportData', JSON.stringify(generatedReports));
    }

    setIsReportDisplayModalOpen(true);
  };


  const dashboardPeriodOptions: { value: DashboardPeriod; label: string }[] = [
    { value: 'today', label: t('today') },
    { value: 'this_month', label: t('thisMonth') },
    { value: 'last_30_days', label: t('last30Days') },
    { value: 'this_year', label: t('thisYear') },
  ];

  const financialPeriodOptions: { value: FinancialPeriodFilter; label: string }[] = [
    { value: 'daily', label: t('Diário') },
    { value: 'monthly', label: t('Mensal') },
    { value: 'yearly', label: t('Anual') },
  ];
  
  const financialTypeOptions: { value: FinancialTypeFilter; label: string }[] = [
      { value: 'all', label: t('all') },
      { value: 'income', label: t('income') },
      { value: 'expense', label: t('expense') },
  ];


  if (!mounted) {
    return null;
  }

  return (
    <>
    <div className="flex flex-col h-full">
      <div className="space-y-8 flex-1">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('settings')}</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            {t('settingsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">{t('appearance')}</CardTitle>
              <CardDescription className="text-lg">
                {t('appearanceDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <div className="space-y-4">
                <Label className="text-lg">{t('theme')}</Label>
                <RadioGroup
                  value={theme}
                  onValueChange={setTheme}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                  <div>
                    <RadioGroupItem
                      value="light"
                      id="light"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="light"
                      className={cn(
                        'flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                        'hover:text-primary hover:border-primary/50',
                        'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                      )}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                      {t('light')}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="dark"
                      id="dark"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="dark"
                      className={cn(
                        'flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                        'hover:text-primary hover:border-primary/50',
                        'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                      )}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                      {t('dark')}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="system"
                      id="system"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="system"
                      className={cn(
                        'flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                        'hover:text-primary hover:border-primary/50',
                        'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                      )}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                        <path d="M12 18h.01" />
                      </svg>
                      {t('system')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <Separator />
              <div className="space-y-4">
                <Label className="text-lg">{t('language')}</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="pt-br"
                      checked={language === 'pt-BR'}
                      onCheckedChange={() => handleLanguageChange('pt-BR')}
                    />
                    <Label
                      htmlFor="pt-br"
                      className="text-base cursor-pointer"
                    >
                      Português (Brasil)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="en-us"
                      checked={language === 'en-US'}
                      onCheckedChange={() => handleLanguageChange('en-US')}
                    />
                    <Label
                      htmlFor="en-us"
                      className="text-base cursor-pointer"
                    >
                      English
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">{t('dashboard')}</CardTitle>
              <CardDescription className="text-lg">
                {t('dashboardSettingsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
               <div className="space-y-4">
                <Label className="text-lg">{t('newSubscriptionsPeriod')}</Label>
                 <RadioGroup
                    value={newSubscriptionsPeriod}
                    onValueChange={(value) => setNewSubscriptionsPeriod(value as DashboardPeriod)}
                    className="space-y-2"
                  >
                  {dashboardPeriodOptions.map(option => (
                     <div className="flex items-center space-x-2" key={option.value}>
                       <RadioGroupItem value={option.value} id={option.value} />
                       <Label htmlFor={option.value} className="text-base font-normal cursor-pointer">{option.label}</Label>
                     </div>
                  ))}
                 </RadioGroup>
              </div>
              <Separator/>
              <div className="space-y-4">
                <Label className="text-lg" htmlFor="expiration-warning-days">{t('expirationWarning')}</Label>
                 <div className="flex items-center gap-4">
                    <Input 
                        id="expiration-warning-days"
                        type="number"
                        min="1"
                        max="30"
                        value={expirationWarningDays}
                        onChange={handleWarningDaysChange}
                        className="w-24"
                    />
                    <span className="text-muted-foreground">{t('days')}</span>
                 </div>
                 <p className="text-sm text-muted-foreground">{t('expirationWarningDescription')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">{t('financial')}</CardTitle>
              <CardDescription className="text-lg">
                {t('financialSettingsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
               <div className="space-y-4">
                <Label className="text-lg">{t('period')}</Label>
                 <RadioGroup
                    value={financialPeriodFilter}
                    onValueChange={(value) => setFinancialPeriodFilter(value as FinancialPeriodFilter)}
                    className="space-y-2"
                  >
                  {financialPeriodOptions.map(option => (
                     <div className="flex items-center space-x-2" key={option.value}>
                       <RadioGroupItem value={option.value} id={`financial-period-${option.value}`} />
                       <Label htmlFor={`financial-period-${option.value}`} className="text-base font-normal cursor-pointer">{option.label}</Label>
                     </div>
                  ))}
                 </RadioGroup>
              </div>
              <Separator/>
              <div className="space-y-4">
                <Label className="text-lg">{t('type')}</Label>
                 <RadioGroup
                    value={financialTypeFilter}
                    onValueChange={(value) => setFinancialTypeFilter(value as FinancialTypeFilter)}
                    className="space-y-2"
                  >
                  {financialTypeOptions.map(option => (
                     <div className="flex items-center space-x-2" key={option.value}>
                       <RadioGroupItem value={option.value} id={`financial-type-${option.value}`} />
                       <Label htmlFor={`financial-type-${option.value}`} className="text-base font-normal cursor-pointer">{option.label}</Label>
                     </div>
                  ))}
                 </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">{t('reports')}</CardTitle>
              <CardDescription className="text-lg">
                {t('reportsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button onClick={() => setIsReportModalOpen(true)}>{t('generateReport')}</Button>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">{t('backupAndRestore')}</CardTitle>
              <CardDescription className="text-lg">
                {t('backupAndRestoreDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-0">
                <Button onClick={exportData} className="w-full">{t('exportBackup')}</Button>
                <Button onClick={handleImportClick} variant="outline" className="w-full">{t('importBackup')}</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json,.txt"
                    onChange={handleFileChange}
                />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
    <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateReport}
    />
    <ReportDisplayModal
        isOpen={isReportDisplayModalOpen}
        onClose={() => setIsReportDisplayModalOpen(false)}
    />
     <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('importBackupWarningTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('importBackupWarningDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      