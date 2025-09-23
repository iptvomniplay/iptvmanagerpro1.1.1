
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileText, X, UserCheck, PieChart, UserX, TestTube, Wallet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Client } from '@/lib/types';
import { ClientSearch } from '@/app/subscription/components/client-search';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const reportConfig = {
  clientList: {
    label: 'geralDeClientes',
    type: 'fields',
    category: 'client',
    icon: UserCheck,
    fields: {
      fullName: 'fullName',
      clientId: 'clientID',
      status: 'status',
      registeredDate: 'registeredDate',
      contact: 'phone',
      panel: 'panel',
      server: 'servers',
      numberOfTests: 'report_numberOfTests',
    },
  },
  expiredSubscriptions: {
    label: 'assinaturasExpiradas',
    type: 'fields',
    category: 'client',
    icon: UserX,
    fields: {
      fullName: 'fullName',
      lastPlan: 'lastPlan',
      expirationDate: 'expirationDate',
      contact: 'phone',
    },
  },
  activeTests: {
    label: 'testesAtivosExpirados',
    type: 'fields',
    category: 'client',
    icon: TestTube,
    fields: {
      clientName: 'clientName',
      testPackage: 'testPackage',
      startTime: 'startTime',
      endTime: 'endTime',
    },
  },
  panelUsage: {
    label: 'report_panelUsage',
    type: 'statistic',
    category: 'statistic',
    icon: PieChart,
    globalOnly: true,
  },
  subServerUsage: {
    label: 'report_subServerUsage',
    type: 'statistic',
    category: 'statistic',
    icon: PieChart,
    globalOnly: true,
  },
  creditBalance: {
    label: 'report_creditBalance',
    type: 'fields',
    category: 'statistic',
    icon: Wallet,
    globalOnly: true,
    fields: {
      panelName: 'serverName',
      currentBalance: 'currentBalance',
      paymentMethod: 'paymentMethod',
    },
  },
} as const;


export type ReportKey = keyof typeof reportConfig;

type FieldReportConfig = {
  [K in ReportKey]: (typeof reportConfig)[K] extends { type: 'fields' } ? (typeof reportConfig)[K] : never;
}[ReportKey];

type StatisticReportConfig = {
  [K in ReportKey]: (typeof reportConfig)[K] extends { type: 'statistic' } ? (typeof reportConfig)[K] : never;
}[ReportKey];


export type FieldKey<T extends FieldReportConfig['label']> = keyof {
    [K in ReportKey as (typeof reportConfig)[K]['label'] extends T ? K : never]: (typeof reportConfig)[K] extends { fields: any } ? (typeof reportConfig)[K]['fields'] : never
}[keyof any];


export type SelectedReportsState = {
  [K in ReportKey]?: (typeof reportConfig)[K] extends { type: 'fields' }
    ? { all: boolean; fields: { [P in keyof (typeof reportConfig)[K]['fields']]?: boolean } }
    : { all: boolean };
};


interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (selectedReports: SelectedReportsState, clientContext?: Client | null) => void;
  initialClientContext?: Client | null;
}

export function ReportModal({ isOpen, onClose, onGenerate, initialClientContext = null }: ReportModalProps) {
  const { t } = useLanguage();
  const [selectedReports, setSelectedReports] = React.useState<SelectedReportsState>({});
  const [clientContext, setClientContext] = React.useState<Client | null>(initialClientContext);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({ client: true, statistic: true });
  const [openCards, setOpenCards] = React.useState<Record<ReportKey, boolean>>({});

  React.useEffect(() => {
    if (isOpen) {
      setClientContext(initialClientContext);
      setSelectedReports({});
      setOpenCards({});
    }
  }, [isOpen, initialClientContext]);

  const handleSelectAll = (reportKey: ReportKey, checked: boolean) => {
    const config = reportConfig[reportKey];
    if (config.type === 'fields') {
      const allFields = Object.keys(config.fields).reduce((acc, field) => {
        acc[field as keyof typeof config.fields] = checked;
        return acc;
      }, {} as { [P in keyof typeof config.fields]?: boolean });

      setSelectedReports(prev => ({
        ...prev,
        [reportKey]: {
          all: checked,
          fields: allFields,
        },
      }));
    } else {
       setSelectedReports(prev => ({
        ...prev,
        [reportKey]: {
          all: checked,
        },
      }));
    }
  };

  const handleFieldChange = (reportKey: ReportKey, fieldKey: string, checked: boolean) => {
    setSelectedReports(prev => {
      const currentReport = prev[reportKey] as SelectedReportsState[typeof reportKey] & { fields: any } | undefined;
      const updatedFields = { ...currentReport?.fields, [fieldKey]: checked };
      
      const config = reportConfig[reportKey];
      if (config.type !== 'fields') return prev;

      const allFields = Object.keys(config.fields);
      const allChecked = allFields.every(field => updatedFields[field as keyof typeof config.fields]);

      return {
        ...prev,
        [reportKey]: {
          all: allChecked,
          fields: updatedFields,
        },
      };
    });
  };

  const handleGenerateClick = () => {
    onGenerate(selectedReports, clientContext);
  };

  const handleGenerateFullReport = () => {
    const fullReportState: SelectedReportsState = {};
    for (const key in reportConfig) {
        const reportKey = key as ReportKey;
        const config = reportConfig[reportKey];
        if (clientContext && config.globalOnly) {
          continue;
        }

        if (config.type === 'fields') {
            const allFields = Object.keys(config.fields).reduce((acc, field) => {
                acc[field as keyof typeof config.fields] = true;
                return acc;
            }, {} as { [P in keyof typeof config.fields]?: boolean });
            
            fullReportState[reportKey] = {
                all: true,
                fields: allFields
            };
        } else {
             fullReportState[reportKey] = {
                all: true
            };
        }
    }
    onGenerate(fullReportState, clientContext);
  };
  
  const isAnyReportSelected = Object.values(selectedReports).some(report => {
    if (!report) return false;

    if ('all' in report && report.all) return true;
    
    const reportKey = Object.keys(selectedReports).find(key => selectedReports[key as ReportKey] === report) as ReportKey;
    if(!reportKey) return false;

    const config = reportConfig[reportKey];

    if (config.type === 'fields' && 'fields' in report && report.fields) {
        return Object.values(report.fields).some(field => field);
    }
    
    return false;
  });

  const reportGroups = Object.entries(reportConfig).reduce((acc, [key, config]) => {
    const category = config.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    if (!clientContext || !config.globalOnly) {
      acc[category].push([key as ReportKey, config]);
    }
    return acc;
  }, {} as Record<string, [ReportKey, typeof reportConfig[ReportKey]][]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{clientContext ? t('generateClientReport', { clientName: clientContext.name }) : t('selectReports')}</DialogTitle>
          <DialogDescription>{t('selectReportsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-6">
          {!initialClientContext && (
            <div className="space-y-4">
                {clientContext ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-dashed w-fit">
                        <div className="flex items-center gap-3">
                            <UserCheck className="h-6 w-6 text-primary"/>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{t('client')}</span>
                                <p className="font-bold text-lg">{clientContext.name}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setClientContext(null)}>
                            <X className="h-5 w-5"/>
                        </Button>
                    </div>
                ) : (
                    <ClientSearch onSelectClient={setClientContext} selectedClient={clientContext} />
                )}
                <Separator />
            </div>
          )}
          
          <Button onClick={handleGenerateFullReport} className="w-full" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              {t('generateFullReport')}
          </Button>

          <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-muted-foreground text-sm">{t('or')}</span>
          </div>

          <div className="space-y-6">
            {Object.entries(reportGroups).map(([category, reports]) => {
              if (reports.length === 0) return null;
              return (
              <Collapsible key={category} asChild open={openSections[category] ?? false} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, [category]: isOpen }))}>
                <div>
                  <CollapsibleTrigger asChild>
                    <h3 className="text-xl font-semibold flex items-center gap-2 cursor-pointer mb-4">
                      {category === 'client' ? t('clientReports') : t('statisticsReports')}
                       <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-0 data-[state=closed]:-rotate-90" />
                    </h3>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    {reports.map(([reportKey, config]) => {
                      const Icon = config.icon;
                      return(
                      <Collapsible key={reportKey} asChild open={openCards[reportKey] ?? false} onOpenChange={(isOpen) => setOpenCards(prev => ({ ...prev, [reportKey]: isOpen }))}>
                        <Card>
                          <CardHeader className="p-0">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <Icon className="h-6 w-6 text-primary"/>
                                <CardTitle className="text-lg">{t(config.label)}</CardTitle>
                              </div>
                              {config.type === 'fields' ? (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-0 data-[state=closed]:-rotate-90" />
                                  </Button>
                                </CollapsibleTrigger>
                              ) : (
                                <Checkbox
                                    id={`${reportKey}-all`}
                                    checked={selectedReports[reportKey]?.all || false}
                                    onCheckedChange={(checked) => handleSelectAll(reportKey, checked as boolean)}
                                />
                              )}
                            </div>
                          </CardHeader>
                          {config.type === 'fields' && (
                            <CollapsibleContent>
                              <CardContent className="space-y-4 pt-4 border-t">
                                 <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50">
                                    <Checkbox
                                        id={`${reportKey}-all`}
                                        checked={selectedReports[reportKey]?.all || false}
                                        onCheckedChange={(checked) => handleSelectAll(reportKey, checked as boolean)}
                                    />
                                    <Label htmlFor={`${reportKey}-all`} className="text-base font-bold cursor-pointer">
                                        {t('selectAllFields')}
                                    </Label>
                                 </div>
                                 <Separator/>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                    {Object.entries(config.fields).map(([fieldKey, fieldLabel]) => (
                                        <div key={fieldKey} className="flex items-center space-x-3 p-2 rounded-md">
                                        <Checkbox
                                            id={`${reportKey}-${fieldKey}`}
                                            checked={(selectedReports[reportKey] as any)?.fields?.[fieldKey] || false}
                                            onCheckedChange={(checked) => handleFieldChange(reportKey, fieldKey, checked as boolean)}
                                        />
                                        <Label htmlFor={`${reportKey}-${fieldKey}`} className="text-base font-normal cursor-pointer">
                                            {t(fieldLabel as any)}
                                        </Label>
                                        </div>
                                    ))}
                                 </div>
                              </CardContent>
                            </CollapsibleContent>
                          )}
                        </Card>
                      </Collapsible>
                    )})}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )})}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleGenerateClick} disabled={!isAnyReportSelected}>
            {t('generate')}