
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
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const reportConfig = {
  clientList: {
    label: 'report_clientList',
    fields: {
      fullName: 'fullName',
      clientId: 'clientID',
      status: 'status',
      registeredDate: 'registeredDate',
      contact: 'phone',
    },
  },
  expiredSubscriptions: {
    label: 'report_expiredSubscriptions',
    fields: {
      fullName: 'fullName',
      lastPlan: 'lastPlan',
      expirationDate: 'expirationDate',
      contact: 'phone',
    },
  },
  activeTests: {
    label: 'report_activeTests',
    fields: {
      clientName: 'clientName',
      testPackage: 'testPackage',
      startTime: 'startTime',
      endTime: 'endTime',
    },
  },
  creditBalance: {
    label: 'report_creditBalance',
    fields: {
      panelName: 'serverName',
      currentBalance: 'creditBalance',
      paymentMethod: 'paymentMethod',
    },
  },
} as const;

type ReportKey = keyof typeof reportConfig;
type FieldKey<T extends ReportKey> = keyof (typeof reportConfig)[T]['fields'];

type SelectedReportsState = {
  [K in ReportKey]?: {
    all: boolean;
    fields: { [P in FieldKey<K>]?: boolean };
  };
};

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedReports, setSelectedReports] = React.useState<SelectedReportsState>({});
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<ReportKey, boolean>>({});

  const handleSelectAll = (reportKey: ReportKey, checked: boolean) => {
    const allFields = Object.keys(reportConfig[reportKey].fields).reduce((acc, field) => {
      acc[field as FieldKey<ReportKey>] = checked;
      return acc;
    }, {} as { [P in FieldKey<ReportKey>]?: boolean });

    setSelectedReports(prev => ({
      ...prev,
      [reportKey]: {
        all: checked,
        fields: allFields,
      },
    }));
  };

  const handleFieldChange = (reportKey: ReportKey, fieldKey: FieldKey<ReportKey>, checked: boolean) => {
    setSelectedReports(prev => {
      const currentReport = prev[reportKey] || { all: false, fields: {} };
      const updatedFields = { ...currentReport.fields, [fieldKey]: checked };
      const allChecked = Object.values(updatedFields).every(v => v);

      return {
        ...prev,
        [reportKey]: {
          all: allChecked,
          fields: updatedFields,
        },
      };
    });
  };

  const handleGenerate = () => {
    // For now, this just shows a toast and closes the modal.
    // The actual report generation logic will be added later.
    toast({
      title: t('reportsGeneratedSuccessTitle'),
      description: t('reportsGeneratedSuccessDescription'),
    });
    onClose();
  };
  
  const isAnyReportSelected = Object.values(selectedReports).some(
    report => report && Object.values(report.fields).some(field => field)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('selectReports')}</DialogTitle>
          <DialogDescription>{t('selectReportsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {Object.entries(reportConfig).map(([key, config]) => {
            const reportKey = key as ReportKey;
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
                            checked={selectedReports[reportKey]?.fields?.[fieldKey as FieldKey<ReportKey>] || false}
                            onCheckedChange={(checked) => handleFieldChange(reportKey, fieldKey as FieldKey<ReportKey>, checked as boolean)}
                          />
                          <Label htmlFor={`${reportKey}-${fieldKey}`} className="text-base font-normal cursor-pointer">
                            {t(fieldLabel)}
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={!isAnyReportSelected}>
            {t('generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
