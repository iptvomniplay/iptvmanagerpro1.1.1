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

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>, id?: string) => void;
  note: Note | null;
}

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#fef08a');
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{note ? t('editNote') : t('createNote')}</DialogTitle>
            <DialogDescription>
              {note ? t('editNoteDescription') : t('createNoteDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">{t('name')}</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('namePlaceholder')}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">{t('observations')}</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('notepadPlaceholder')}
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('cardColor')}</Label>
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-md border-2 cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setIsColorPickerOpen(true)}
                />
                 <Button variant="outline" onClick={() => setIsColorPickerOpen(true)}>
                  {t('selectColor')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>{t('saveNote')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ColorPickerModal 
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onSave={handleColorSave}
        initialColor={selectedColor}
      />
    </>
  );
}
