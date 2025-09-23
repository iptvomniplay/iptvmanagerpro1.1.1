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
import { Tv2 } from 'lucide-react';
import { format } from 'date-fns';

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
  const [generationDate, setGenerationDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      try {
        const storedData = sessionStorage.getItem('generatedReportData');
        if (storedData) {
          setReportData(JSON.parse(storedData));
          setGenerationDate(new Date());
        } else {
          setReportData([]);
          setGenerationDate(null);
        }
      } catch (error) {
        console.error("Failed to parse report data from sessionStorage", error);
        setReportData([]);
        setGenerationDate(null);
      }
    }
  }, [isOpen]);

  const handlePrint = () => {
    const printContent = reportContentRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Relatório IPTV Manager Pro</title>');
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
          }).join('');
        
        printWindow.document.write('<style>');
        printWindow.document.write(styles);
        printWindow.document.write(`
          @media print {
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            .printable-page {
              page-break-after: always;
              position: relative;
              min-height: 29.7cm; /* A4 height */
              display: flex;
              flex-direction: column;
            }
            .printable-header, .printable-footer {
                position: absolute;
                width: 100%;
            }
            .printable-header { top: 0; }
            .printable-footer { bottom: 0; }
            .page-break-inside { page-break-inside: avoid; }
            .report-content { flex-grow: 1; padding-top: 5rem; padding-bottom: 3rem; }
          }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-md">
          <div ref={reportContentRef} className="report-content-printable">
            {hasData ? (
                <div className="space-y-6 printable-page">
                   <header className="printable-header p-4 border-b">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Tv2 className="h-8 w-8 text-primary" />
                          <h1 className="text-xl font-bold">Relatório IPTV Manager Pro</h1>
                        </div>
                        {generationDate && (
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{format(generationDate, "dd/MM/yyyy")}</p>
                            <p>{format(generationDate, "HH:mm:ss")}</p>
                          </div>
                        )}
                      </div>
                    </header>

                    <main className="report-content p-4 space-y-8">
                       <div className="page-break-inside rounded-lg border p-4 bg-background">
                         <h2 className="text-lg font-semibold mb-3">Sumário dos Relatórios</h2>
                         <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                           {reportData.map((report, index) => report.rows.length > 0 && <li key={index}>{report.title}</li>)}
                         </ul>
                       </div>

                      {reportData.map((report, index) => (
                        report.rows.length > 0 && (
                          <div key={index} className="page-break-inside">
                            <h2 className="text-xl font-semibold mb-4">{report.title}</h2>
                            <div className="rounded-lg border bg-card text-card-foreground">
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
                    </main>
                    <footer className="printable-footer p-4 border-t text-center text-xs text-muted-foreground">
                       Página <span className="page-number">1</span> de <span className="total-pages">1</span>
                    </footer>
                </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">{t('noDataForReport')}</p>
              </div>
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