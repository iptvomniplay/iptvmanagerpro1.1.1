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
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id'> & { id?: string }) => void;
  note: Note | null;
}

const colorPalette = [
  '#fde047', // yellow-400
  '#60a5fa', // blue-400
  '#4ade80', // green-400
  '#f87171', // red-400
  '#c084fc', // purple-400
  '#9ca3af', // gray-400
];

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(colorPalette[0]);

  React.useEffect(() => {
    if (isOpen) {
      setContent(note?.content || '');
      setSelectedColor(note?.color || colorPalette[0]);
    }
  }, [isOpen, note]);

  const handleSave = () => {
    onSave({
      id: note?.id,
      content,
      color: selectedColor,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{note ? t('editNote') : t('createNote')}</DialogTitle>
          <DialogDescription>
            {note ? t('editNoteDescription') : t('createNoteDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('notepadPlaceholder')}
            className="min-h-[200px] text-base"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">{t('cardColor')}:</p>
            <div className="flex gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    selectedColor === color ? 'ring-2 ring-ring ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                >
                  {selectedColor === color && <Check className="h-5 w-5 mx-auto my-auto text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            {t('saveNote')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
