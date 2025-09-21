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
import type { Note } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

export function ViewNoteModal({ isOpen, onClose, note }: ViewNoteModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content).then(() => {
      toast({
        title: t('textCopied'),
        description: t('textCopiedSuccess'),
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl" style={{ backgroundColor: note.color }}>
        <DialogHeader>
          <DialogTitle>{t('noteDetails')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4">
            <p className="text-base whitespace-pre-wrap p-1">{note.content}</p>
        </ScrollArea>
        <DialogFooter className="justify-between">
            <Button variant="secondary" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {t('copyText')}
            </Button>
            <Button variant="secondary" onClick={onClose}>
                {t('close')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
