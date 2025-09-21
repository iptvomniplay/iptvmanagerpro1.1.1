
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
import { useLanguage } from '@/hooks/use-language';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

export type GeneratedReportData = {
  title: string;
  headers: string[];
  rows: (string | undefined)[][];
};

interface ReportDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDisplayModal({ isOpen, onClose }: ReportDisplayModalProps) {
  const { t } = useLanguage();
  const reportContentRef = React.useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = React.useState<GeneratedReportData[]>([]);
  const [sessionData, setSessionData] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      try {
        const storedData = sessionStorage.getItem('generatedReportData');
        if (storedData) {
          setReportData(JSON.parse(storedData));
        } else {
          setReportData([]);
        }
      } catch (error) {
        console.error("Failed to parse report data from sessionStorage", error);
        setReportData([]);
      }
    }
  }, [isOpen]);

  const handlePrint = () => {
    const printContent = reportContentRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Report</title>');
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
              console.warn('Cannot read styles from cross-origin stylesheet.');
              return '';
            }
          })
          .join('');
        printWindow.document.write('<style>@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } .page-break { page-break-inside: avoid; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  const checkSessionStorage = () => {
    const data = sessionStorage.getItem('generatedReportData');
    setSessionData(data ? JSON.stringify(JSON.parse(data), null, 2) : 'No data found in sessionStorage.');
  };

  const hasData = reportData.length > 0 && reportData.some(r => r.rows.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('generatedReport')}</DialogTitle>
          <DialogDescription>{t('generatedReportDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div ref={reportContentRef} className="report-content-printable">
            {hasData ? (
              <div className="space-y-8">
                {reportData.map((report, index) => (
                  report.rows.length > 0 && (
                    <div key={index} className="page-break">
                      <h2 className="text-xl font-semibold mb-4">{report.title}</h2>
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {report.headers.map((header, hIndex) => (
                                <TableHead key={hIndex} className="bg-muted/50">{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.rows.map((row, rIndex) => (
                              <TableRow key={rIndex}>
                                {row.map((cell, cIndex) => (
                                  <TableCell key={cIndex}>{cell || '-'}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">{t('noDataForReport')}</p>
              </div>
            )}
          </div>
          <div className="no-print border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">{t('dataVerification')}</h3>
            <p className="text-sm text-muted-foreground mb-2">{t('dataVerificationDescription')}</p>
            <Button onClick={checkSessionStorage} variant="outline">{t('checkSavedData')}</Button>
            {sessionData && (
              <Textarea
                readOnly
                value={sessionData}
                className="mt-2 h-48 bg-muted/50 font-mono text-xs"
              />
            )}
          </div>
        </div>
        <DialogFooter className="border-t pt-4 no-print">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          <Button onClick={handlePrint} disabled={!hasData}>
            {t('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
