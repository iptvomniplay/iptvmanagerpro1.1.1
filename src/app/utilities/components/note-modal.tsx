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
import { Check, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const defaultPalette = [
  '#fde047', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#9ca3af',
];

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id'> & { id?: string }) => void;
  note: Note | null;
}

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(defaultPalette[0]);
  const [favoriteColors, setFavoriteColors] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('notepad_favorite_colors');
      if (savedFavorites) {
        setFavoriteColors(JSON.parse(savedFavorites));
      } else {
        setFavoriteColors(defaultPalette);
      }
    } catch (error) {
      console.error("Failed to load favorite colors from localStorage", error);
      setFavoriteColors(defaultPalette);
    }
  }, []);

  const saveFavoritesToStorage = (colors: string[]) => {
    localStorage.setItem('notepad_favorite_colors', JSON.stringify(colors));
    setFavoriteColors(colors);
  };


  React.useEffect(() => {
    if (isOpen) {
      setContent(note?.content || '');
      setSelectedColor(note?.color || favoriteColors[0] || defaultPalette[0]);
    }
  }, [isOpen, note, favoriteColors]);

  const handleSave = () => {
    onSave({
      id: note?.id,
      content,
      color: selectedColor,
    });
  };

  const handleAddFavorite = () => {
    if (selectedColor && !favoriteColors.includes(selectedColor)) {
      const newFavorites = [...favoriteColors, selectedColor];
      saveFavoritesToStorage(newFavorites);
    }
  };

  const handleRemoveFavorite = (colorToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favoriteColors.filter(color => color !== colorToRemove);
    saveFavoritesToStorage(newFavorites);
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
        <div className="py-4 space-y-6">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('notepadPlaceholder')}
            className="min-h-[200px] text-base"
            autoFocus
          />
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">{t('cardColor')}:</p>
            <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 shrink-0">
                    <Input 
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="h-full w-full p-0 border-none cursor-pointer"
                    />
                </div>
                <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-10 text-base"
                />
                <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleAddFavorite} aria-label="Adicionar cor aos favoritos">
                    <Plus />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t mt-4">
              {favoriteColors.map((color) => (
                <div key={color} className="relative group">
                    <button
                        type="button"
                        className={cn(
                            'h-9 w-9 rounded-full border-2 transition-all',
                            selectedColor === color ? 'ring-2 ring-ring ring-offset-2' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                    >
                    {selectedColor === color && <Check className="h-5 w-5 mx-auto my-auto text-white" />}
                    </button>
                    <button 
                        onClick={(e) => handleRemoveFavorite(color, e)} 
                        className="absolute -top-2 -right-2 h-5 w-5 bg-muted rounded-full flex items-center justify-center border border-destructive/50 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remover cor ${color}`}
                    >
                        <X className="h-3 w-3"/>
                    </button>
                </div>
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
