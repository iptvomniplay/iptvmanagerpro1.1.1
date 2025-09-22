
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
import { Note } from '@/lib/types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Tv2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

export function NotePrintModal({ isOpen, onClose, notes }: NotePrintModalProps) {
  const { t } = useLanguage();
  const printContentRef = React.useRef<HTMLDivElement>(null);
  const [generationDate] = React.useState(new Date());

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Anotações - IPTV Manager Pro</title>');
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
            body { 
                -webkit-print-color-adjust: exact; 
                color-adjust: exact; 
                font-family: Arial, sans-serif;
            }
            .no-print { display: none !important; }
            .printable-header, .printable-footer { display: none; }
            .note-card-print {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 16px;
                page-break-inside: avoid;
                margin-bottom: 16px;
            }
             .prose { max-width: 100%; }
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
  
  const hasData = notes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('printNotes')}</DialogTitle>
          <DialogDescription>{t('printNotesDescription')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div ref={printContentRef} className="p-4 space-y-4 bg-muted/30 rounded-md">
                <header className="printable-header p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Tv2 className="h-8 w-8 text-primary" />
                      <h1 className="text-xl font-bold">Anotações - IPTV Manager Pro</h1>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(generationDate, "dd/MM/yyyy")}</p>
                      <p>{format(generationDate, "HH:mm:ss")}</p>
                    </div>
                  </div>
                </header>
                {hasData ? (
                    <div className="space-y-4">
                        {notes.map(note => (
                            <div key={note.id} className="note-card-print bg-background" style={{ borderColor: note.color, borderLeftWidth: '4px' }}>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-bold">{note.title}</h2>
                                    {note.favorite && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>}
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{note.content}</ReactMarkdown>
                                </div>
                                <p className="text-xs text-foreground/60 mt-4 text-right">{format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-lg text-muted-foreground">{t('noNotesYet')}</p>
                    </div>
                )}
            </div>
        </ScrollArea>
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
