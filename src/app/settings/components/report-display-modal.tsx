
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

export type GeneratedReportData = {
  title: string;
  headers: string[];
  rows: (string | undefined)[][];
};

interface ReportDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: GeneratedReportData[];
}

export function ReportDisplayModal({ isOpen, onClose, reportData }: ReportDisplayModalProps) {
  const { t } = useLanguage();
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = reportContentRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Report</title>');
        // Inject styles
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
        printWindow.document.write(`<style>${styles} body { -webkit-print-color-adjust: exact; } .no-print { display: none; } </style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const hasData = reportData.length > 0 && reportData.some(r => r.rows.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('generatedReport')}</DialogTitle>
          <DialogDescription>{t('generatedReportDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4" ref={reportContentRef}>
          {hasData ? (
            <div className="space-y-8 report-content">
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
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} className="no-print">
            {t('close')}
          </Button>
          <Button onClick={handlePrint} disabled={!hasData} className="no-print">
            {t('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

