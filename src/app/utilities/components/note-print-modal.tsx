
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

export function NotePrintModal({ isOpen, onClose, notes }: NotePrintModalProps) {
  const { t } = useLanguage();
  const printContentRef = React.useRef<HTMLDivElement>(null);
  const [generationDate, setGenerationDate] = React.useState(new Date());
  const [selectedNotes, setSelectedNotes] = React.useState<Record<string, boolean>>({});
  const [view, setView] = React.useState<'selection' | 'print'>('selection');

  React.useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setView('selection');
      setSelectedNotes({});
      setGenerationDate(new Date());
    }
  }, [isOpen]);
  
  const handleSelectAll = (checked: boolean) => {
    const newSelectedNotes: Record<string, boolean> = {};
    if (checked) {
      notes.forEach(note => {
        newSelectedNotes[note.id] = true;
      });
    }
    setSelectedNotes(newSelectedNotes);
  };
  
  const handleNoteSelect = (noteId: string, checked: boolean) => {
    setSelectedNotes(prev => ({
      ...prev,
      [noteId]: checked,
    }));
  };

  const notesToPrint = notes.filter(note => selectedNotes[note.id]);
  const allSelected = notes.length > 0 && notes.every(note => selectedNotes[note.id]);
  const isAnyNoteSelected = Object.values(selectedNotes).some(isSelected => isSelected);

  const handleGeneratePrintView = () => {
    if (isAnyNoteSelected) {
      setView('print');
    }
  };

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
  
  const hasNotes = notes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('printNotes')}</DialogTitle>
          <DialogDescription>
            {view === 'selection' ? t('selectNotesToPrint') : t('printNotesDescription')}
          </DialogDescription>
        </DialogHeader>
        
        {view === 'selection' ? (
           <div className="flex-1 flex flex-col min-h-0">
             <div className="flex items-center space-x-3 p-4 border-b">
                <Checkbox
                    id="select-all-notes"
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    disabled={!hasNotes}
                />
                <Label htmlFor="select-all-notes" className="text-base font-bold cursor-pointer">
                    {t('selectAllFields')}
                </Label>
             </div>
             <ScrollArea className="flex-1">
                 <div className="p-4 space-y-3">
                     {hasNotes ? (
                         notes.map(note => (
                             <div key={note.id} className="flex items-center space-x-3 p-3 rounded-md border bg-muted/50">
                                 <Checkbox
                                     id={`note-select-${note.id}`}
                                     checked={!!selectedNotes[note.id]}
                                     onCheckedChange={(checked) => handleNoteSelect(note.id, checked as boolean)}
                                 />
                                 <Label htmlFor={`note-select-${note.id}`} className="flex-1 cursor-pointer">
                                     <p className="font-semibold">{note.title}</p>
                                     <p className="text-xs text-muted-foreground">{format(new Date(note.createdAt), 'dd/MM/yyyy')}</p>
                                 </Label>
                                 {note.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>}
                                 <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: note.color }} />
                             </div>
                         ))
                     ) : (
                         <div className="text-center py-20">
                             <p className="text-lg text-muted-foreground">{t('noNotesYet')}</p>
                         </div>
                     )}
                 </div>
             </ScrollArea>
           </div>
        ) : (
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
                    {notesToPrint.length > 0 ? (
                        <div className="space-y-4">
                            {notesToPrint.map(note => (
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
        )}

        <DialogFooter className="border-t pt-4 no-print">
          {view === 'selection' ? (
            <>
                <Button variant="outline" onClick={onClose}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleGeneratePrintView} disabled={!isAnyNoteSelected}>
                    {t('generate')}
                </Button>
            </>
          ) : (
            <>
                <Button variant="outline" onClick={() => setView('selection')}>
                    {t('backToEdit')}
                </Button>
                <Button onClick={handlePrint} disabled={notesToPrint.length === 0}>
                    {t('print')}
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
