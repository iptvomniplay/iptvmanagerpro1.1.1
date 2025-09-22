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
import { Plus, Trash2 } from 'lucide-react';
import { useData } from '@/hooks/use-data';

// Helper functions for color conversion
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>, id?: string) => void;
  note: Note | null;
}

const defaultColors = ['#fecaca', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa'];

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#fef08a');
  const [favoriteColors, setFavoriteColors] = React.useState<string[]>(defaultColors);
  const [isEditingFavorites, setIsEditingFavorites] = React.useState(false);

  React.useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteColors');
    if (storedFavorites) {
      setFavoriteColors(JSON.parse(storedFavorites));
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('favoriteColors', JSON.stringify(favoriteColors));
  }, [favoriteColors]);

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedColor(note.color);
    } else {
      setTitle('');
      setContent('');
      setSelectedColor(favoriteColors[1] || '#fef08a');
    }
  }, [note, isOpen, favoriteColors]);

  const handleSave = () => {
    onSave({ title, content, color: selectedColor, favorite: note?.favorite || false }, note?.id);
  };

  const handleAddFavorite = () => {
    if (!favoriteColors.includes(selectedColor)) {
      setFavoriteColors(prev => [...prev, selectedColor]);
    }
  };

  const handleRemoveFavorite = (colorToRemove: string) => {
    if (favoriteColors.length > 1) {
        setFavoriteColors(prev => prev.filter(color => color !== colorToRemove));
    }
  };
  
  const rgb = hexToRgb(selectedColor);

  return (
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
          <div className="space-y-4">
            <Label>{t('cardColor')}</Label>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-md border-2"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hex-color" className="w-10">HEX</Label>
                  <Input
                    id="hex-color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-28"
                  />
                </div>
                 <div className="flex items-center gap-2">
                  <Label htmlFor="rgb-r" className="w-10">RGB</Label>
                  <Input id="rgb-r" type="number" max={255} min={0} value={rgb?.r || 0} onChange={e => setSelectedColor(rgbToHex(Number(e.target.value), rgb?.g || 0, rgb?.b || 0))} className="w-16" />
                  <Input id="rgb-g" type="number" max={255} min={0} value={rgb?.g || 0} onChange={e => setSelectedColor(rgbToHex(rgb?.r || 0, Number(e.target.value), rgb?.b || 0))} className="w-16" />
                  <Input id="rgb-b" type="number" max={255} min={0} value={rgb?.b || 0} onChange={e => setSelectedColor(rgbToHex(rgb?.r || 0, rgb?.g || 0, Number(e.target.value)))} className="w-16" />
                </div>
              </div>
            </div>
          </div>
           <div className="space-y-3">
             <div className="flex items-center justify-between">
                <Label>{t('favoriteColors')}</Label>
                <Button variant="link" onClick={() => setIsEditingFavorites(!isEditingFavorites)}>
                    {isEditingFavorites ? t('save') : t('edit')}
                </Button>
             </div>
            <div className="flex flex-wrap items-center gap-2">
              {favoriteColors.map((color) => (
                 <div key={color} className="relative group">
                    <button
                        type="button"
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                    />
                    {isEditingFavorites && (
                        <button 
                            onClick={() => handleRemoveFavorite(color)}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    )}
                 </div>
              ))}
               <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={handleAddFavorite}>
                    <Plus className="h-4 w-4" />
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
  );
}
