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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import type { Note } from '@/lib/types';
import { ColorPickerModal } from './color-picker-modal';
import { Copy, Printer, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>, id?: string) => void;
  note: Note | null;
}

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#fef08a');
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const printContentRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedColor(note.color);
    } else {
      setTitle('');
      setContent('');
      setSelectedColor('#fef08a');
    }
  }, [note, isOpen]);

  const handleSave = () => {
    onSave({ title, content, color: selectedColor, favorite: note?.favorite || false }, note?.id);
  };
  
  const handleColorSave = (newColor: string) => {
    setSelectedColor(newColor);
    setIsColorPickerOpen(false);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: t('textCopied'),
      description: t('textCopiedSuccess'),
    });
  };

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Anotação - IPTV Manager Pro</title>');
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


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg h-full sm:h-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>{note ? t('editNote') : t('createNote')}</DialogTitle>
            <DialogDescription>
              {note ? t('editNoteDescription') : t('createNoteDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
             <ScrollArea className="h-full pr-6">
                <div className="space-y-6 pt-4 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">{t('title')}</Label>
                    <Input
                      id="note-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-content">{t('message')}</Label>
                    <Textarea
                      id="note-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('notepadPlaceholder')}
                      className="min-h-[250px] sm:min-h-[150px]"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>{t('cardColor')}</Label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="h-12 w-12 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: selectedColor }}
                        onClick={() => setIsColorPickerOpen(true)}
                        aria-label={t('selectColor')}
                      />
                    </div>
                  </div>
                   <Button onClick={handleSave} className="w-full">{t('saveNote')}</Button>
                </div>
            </ScrollArea>
          </div>
          <DialogFooter className="justify-between mt-auto border-t pt-4">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCopy} disabled={!content}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('copyText')}
                </Button>
                  <Button variant="ghost" onClick={handlePrint} disabled={!content}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t('print')}
                </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ColorPickerModal 
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onSave={handleColorSave}
        initialColor={selectedColor}
      />
      
      <div className="hidden">
        <div ref={printContentRef} className="p-4 space-y-4">
            {note && (
                <div className="note-card-print bg-background" style={{ borderColor: note.color, borderLeftWidth: '4px' }}>
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-bold">{note.title}</h2>
                        {note.favorite && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                    <p className="text-xs text-foreground/60 mt-4 text-right">{format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
}
