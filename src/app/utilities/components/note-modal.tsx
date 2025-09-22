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
import { Check, Plus, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const defaultPalette = [
  '#fde047', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#9ca3af',
];

// Funções de conversão de cor
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
};


interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id'> & { id?: string }) => void;
  note: Note | null;
}

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const { t } = useLanguage();
  const [content, setContent] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#fde047');
  const [favoriteColors, setFavoriteColors] = React.useState<string[]>([]);
  const [colorMode, setColorMode] = React.useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [isEditingPalette, setIsEditingPalette] = React.useState(false);
  
  const [rgb, setRgb] = React.useState({ r: 253, g: 224, b: 71 });
  const [hsl, setHsl] = React.useState({ h: 54, s: 97, l: 64 });

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
  
  const updateColorState = (hex: string) => {
    const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    if (!validHex) return;

    setSelectedColor(hex);
    const newRgb = hexToRgb(hex);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };


  React.useEffect(() => {
    if (isOpen) {
      setContent(note?.content || '');
      const initialColor = note?.color || favoriteColors[0] || defaultPalette[0];
      updateColorState(initialColor);
      setIsEditingPalette(false);
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
  
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setSelectedColor(newHex);
    if (/^#([A-Fa-f0-9]{6})$/.test(newHex)) {
      updateColorState(newHex);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgb, [channel]: numValue };
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    updateColorState(newHex);
  };

  const handleHslChange = (channel: 'h' | 's' | 'l', value: string) => {
    const max = channel === 'h' ? 360 : 100;
    const numValue = Math.max(0, Math.min(max, parseInt(value) || 0));
    const newHsl = { ...hsl, [channel]: numValue };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setSelectedColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };
  
  const handleColorSwatchClick = (color: string) => {
    if (isEditingPalette) return;
    updateColorState(color);
  }

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
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div 
                    className="h-11 w-11 rounded-md border"
                    style={{ backgroundColor: selectedColor }}
                ></div>
                <div className="flex-1 space-y-2">
                  <RadioGroup value={colorMode} onValueChange={(v) => setColorMode(v as any)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hex" id="hex" />
                        <Label htmlFor="hex">HEX</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rgb" id="rgb" />
                        <Label htmlFor="rgb">RGB</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hsl" id="hsl" />
                        <Label htmlFor="hsl">HSL</Label>
                    </div>
                  </RadioGroup>
                  
                  {colorMode === 'hex' && (
                    <Input type="text" value={selectedColor} onChange={handleHexChange} className="font-mono" />
                  )}
                  {colorMode === 'rgb' && (
                    <div className="grid grid-cols-3 gap-2">
                        <Input type="number" min="0" max="255" value={rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} aria-label="Red" />
                        <Input type="number" min="0" max="255" value={rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} aria-label="Green" />
                        <Input type="number" min="0" max="255" value={rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} aria-label="Blue" />
                    </div>
                  )}
                  {colorMode === 'hsl' && (
                    <div className="grid grid-cols-3 gap-2">
                        <Input type="number" min="0" max="360" value={hsl.h} onChange={(e) => handleHslChange('h', e.target.value)} aria-label="Hue" />
                        <Input type="number" min="0" max="100" value={hsl.s} onChange={(e) => handleHslChange('s', e.target.value)} aria-label="Saturation" />
                        <Input type="number" min="0" max="100" value={hsl.l} onChange={(e) => handleHslChange('l', e.target.value)} aria-label="Lightness" />
                    </div>
                  )}
                </div>
                <Button size="icon" className="h-11 w-11 shrink-0" onClick={handleAddFavorite} aria-label={t('add')}>
                    <Plus />
                </Button>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t mt-4">
               <div className="flex justify-between items-center">
                 <p className="text-sm font-medium text-muted-foreground">{t('favoriteColors')}</p>
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingPalette(!isEditingPalette)}
                 >
                   {isEditingPalette ? (
                     <>
                       <Check className="mr-2 h-4 w-4" />
                       {t('ok')}
                     </>
                   ) : (
                     <>
                       <Pencil className="mr-2 h-4 w-4" />
                       {t('edit')}
                     </>
                   )}
                 </Button>
               </div>
              <div className="flex flex-wrap gap-3">
                {favoriteColors.map((color) => (
                  <div key={color} className="relative group">
                      <button
                          type="button"
                          className={cn(
                              'h-11 w-11 rounded-full border-2 transition-all',
                              !isEditingPalette && selectedColor === color ? 'ring-2 ring-ring ring-offset-2' : 'border-transparent'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorSwatchClick(color)}
                          aria-label={`Select color ${color}`}
                      >
                       {isEditingPalette && (
                          <div className="absolute inset-0 h-full w-full bg-black/30 flex items-center justify-center rounded-full">
                              <Trash2 className="h-5 w-5 text-white" />
                          </div>
                        )}
                        {!isEditingPalette && selectedColor === color && (
                          <Check className="h-5 w-5 mx-auto my-auto text-white" />
                        )}
                      </button>
                      {isEditingPalette && (
                         <button 
                            onClick={(e) => handleRemoveFavorite(color, e)} 
                            className="absolute inset-0 h-full w-full bg-transparent flex items-center justify-center"
                            aria-label={`Remover cor ${color}`}
                        />
                      )}
                  </div>
                ))}
              </div>
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
