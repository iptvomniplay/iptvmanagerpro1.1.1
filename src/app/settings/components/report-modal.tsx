
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
import { ChevronDown, FileText, X, UserCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Client } from '@/lib/types';
import { ClientSearch } from '@/app/subscription/components/client-search';

export const reportConfig = {
  clientList: {
    label: 'report_clientList',
    type: 'fields',
    fields: {
      fullName: 'fullName',
      clientId: 'clientID',
      status: 'status',
      registeredDate: 'registeredDate',
      contact: 'phone',
      numberOfTests: 'report_numberOfTests',
    },
  },
  expiredSubscriptions: {
    label: 'report_expiredSubscriptions',
    type: 'fields',
    fields: {
      fullName: 'fullName',
      lastPlan: 'lastPlan',
      expirationDate: 'expirationDate',
      contact: 'phone',
    },
  },
  activeTests: {
    label: 'report_activeTests',
    type: 'fields',
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
    globalOnly: true,
  },
  subServerUsage: {
    label: 'report_subServerUsage',
    type: 'statistic',
    globalOnly: true,
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
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<string, boolean>>({});
  const [clientContext, setClientContext] = React.useState<Client | null>(initialClientContext);

  React.useEffect(() => {
    if (isOpen) {
      setClientContext(initialClientContext);
      setSelectedReports({});
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
  
  const isAnyReportSelected = Object.values(selectedReports).some(report => report?.all);

  const reportEntries = Object.entries(reportConfig).filter(([key]) => {
    if (clientContext) {
      return !reportConfig[key as ReportKey].globalOnly;
    }
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{clientContext ? t('generateClientReport', { clientName: clientContext.name }) : t('selectReports')}</DialogTitle>
          <DialogDescription>{t('selectReportsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
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

          <div className="space-y-4">
              {reportEntries.map(([key, config]) => {
                const reportKey = key as ReportKey;
                const isStatisticReport = config.type === 'statistic';
                
                if (isStatisticReport) {
                  return (
                     <div key={reportKey} className="flex items-center space-x-3 p-4 rounded-lg border">
                        <Checkbox
                          id={`${reportKey}-all`}
                          checked={selectedReports[reportKey]?.all || false}
                          onCheckedChange={(checked) => handleSelectAll(reportKey, checked as boolean)}
                        />
                        <Label htmlFor={`${reportKey}-all`} className="text-lg font-semibold cursor-pointer">
                          {t(config.label)}
                        </Label>
                      </div>
                  )
                }

                return (
                  <Collapsible
                    key={reportKey}
                    open={openCollapsibles[reportKey]}
                    onOpenChange={(isOpen) => setOpenCollapsibles(prev => ({ ...prev, [reportKey]: isOpen }))}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-lg hover:bg-accent transition-colors">
                      <span>{t(config.label)}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openCollapsibles[reportKey] ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0">
                      <div className="pt-4 border-t space-y-3">
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
                        <Separator />
                        <div className="grid grid-cols-2 gap-3">
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
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleGenerateClick} disabled={!isAnyReportSelected}>
            {t('generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

