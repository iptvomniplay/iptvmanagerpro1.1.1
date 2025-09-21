
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

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const reportOptions = [
  'report_clientList',
  'report_expiredSubscriptions',
  'report_activeTests',
  'report_creditBalance',
] as const;

type ReportKey = typeof reportOptions[number];

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedReports, setSelectedReports] = React.useState<Record<ReportKey, boolean>>({
    report_clientList: false,
    report_expiredSubscriptions: false,
    report_activeTests: false,
    report_creditBalance: false,
  });

  const handleCheckedChange = (reportKey: ReportKey, checked: boolean) => {
    setSelectedReports(prev => ({ ...prev, [reportKey]: checked }));
  };
  
  const handleGenerate = () => {
    // For now, this just shows a toast and closes the modal.
    // The actual report generation logic will be added later.
    toast({
        title: t('reportsGeneratedSuccessTitle'),
        description: t('reportsGeneratedSuccessDescription'),
    });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('selectReports')}</DialogTitle>
          <DialogDescription>{t('selectReportsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {reportOptions.map(key => (
                <div key={key} className="flex items-center space-x-3 rounded-md border p-4">
                    <Checkbox 
                        id={key}
                        checked={selectedReports[key]}
                        onCheckedChange={(checked) => handleCheckedChange(key, checked as boolean)}
                    />
                    <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                        {t(key)}
                    </Label>
                </div>
            ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={!Object.values(selectedReports).some(v => v)}>
            {t('generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
