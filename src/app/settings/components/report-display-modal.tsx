
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';
import { Printer, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export type GeneratedReportData = {
  title: string;
  headers: string[];
  rows: string[][];
};

interface ReportDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: GeneratedReportData[];
}

export function ReportDisplayModal({ isOpen, onClose, reports }: ReportDisplayModalProps) {
  const { t } = useLanguage();
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">{t('generatedReport')}</DialogTitle>
          <DialogDescription>{t('generatedReportDescription')}</DialogDescription>
        </DialogHeader>

        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-section, #print-section * {
                visibility: visible;
              }
              #print-section {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
              }
              .no-print {
                display: none;
              }
              @page {
                size: auto;
                margin: 0.5in;
              }
            }
          `}
        </style>

        <ScrollArea className="flex-1">
          <div ref={reportContentRef} id="print-section" className="p-6 space-y-8">
            {reports.map((report, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold mb-4">{report.title}</h2>
                {report.rows.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {report.headers.map((header, hIndex) => (
                            <TableHead key={hIndex}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.rows.map((row, rIndex) => (
                          <TableRow key={rIndex}>
                            {row.map((cell, cIndex) => (
                              <TableCell key={cIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('noDataForReport')}</p>
                )}
                {index < reports.length - 1 && <Separator className="mt-8" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t no-print">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            {t('close')}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
