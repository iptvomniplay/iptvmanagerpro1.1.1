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
import { useLanguage } from '@/hooks/use-language';
import { Plus, Trash2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { HexColorPicker } from 'react-colorful';


// Color Conversion Utilities
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
  
    if (max !== min) {
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
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
  
    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
  
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};


interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: string) => void;
  initialColor: string;
}

const defaultColors = ['#fecaca', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa'];

export function ColorPickerModal({ isOpen, onClose, onSave, initialColor }: ColorPickerModalProps) {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = React.useState(initialColor);
  const [rgb, setRgb] = React.useState({ r: 0, g: 0, b: 0 });
  const [hsl, setHsl] = React.useState({ h: 0, s: 0, l: 0 });

  const [favoriteColors, setFavoriteColors] = React.useState<string[]>(defaultColors);
  const [isEditingFavorites, setIsEditingFavorites] = React.useState(false);

  React.useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteColors');
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites);
        if(Array.isArray(parsed)){
          setFavoriteColors(parsed);
        }
      } catch (e) {
        setFavoriteColors(defaultColors);
      }
    }
  }, []);

  const updateColor = (hex: string) => {
    const newRgb = hexToRgb(hex);
    if(newRgb) {
        setSelectedColor(hex);
        setRgb(newRgb);
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      updateColor(initialColor);
    }
  }, [isOpen, initialColor]);
  
  React.useEffect(() => {
    localStorage.setItem('favoriteColors', JSON.stringify(favoriteColors));
  }, [favoriteColors]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    setSelectedColor(hex); // Update input field immediately
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      updateColor(hex);
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [component]: value };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    updateColor(newHex);
  };
  
  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hsl, [component]: value };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    updateColor(newHex);
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

  const handleColorSwatchClick = (color: string) => {
    if (isEditingFavorites) {
      handleRemoveFavorite(color);
    } else {
      updateColor(color);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('selectColor')}</DialogTitle>
          <DialogDescription>{t('selectColorDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
           <HexColorPicker color={selectedColor} onChange={updateColor} className="!w-full" />
            
            <Tabs defaultValue="hex" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="hex">HEX</TabsTrigger>
                    <TabsTrigger value="rgb">RGB</TabsTrigger>
                    <TabsTrigger value="hsl">HSL</TabsTrigger>
                </TabsList>
                <TabsContent value="hex" className="pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="hex-color" className="text-center block">HEX</Label>
                        <Input
                            id="hex-color"
                            value={selectedColor}
                            onChange={handleHexChange}
                            className="w-full text-center"
                            maxLength={7}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="rgb" className="pt-4 space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="rgb-r">Red</Label>
                        <div className="flex items-center gap-4">
                           <Slider id="rgb-r" min={0} max={255} step={1} value={[rgb.r]} onValueChange={([val]) => handleRgbChange('r', val)} />
                           <Input type="number" value={Math.round(rgb.r)} onChange={(e) => handleRgbChange('r', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rgb-g">Green</Label>
                         <div className="flex items-center gap-4">
                           <Slider id="rgb-g" min={0} max={255} step={1} value={[rgb.g]} onValueChange={([val]) => handleRgbChange('g', val)} />
                            <Input type="number" value={Math.round(rgb.g)} onChange={(e) => handleRgbChange('g', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rgb-b">Blue</Label>
                         <div className="flex items-center gap-4">
                           <Slider id="rgb-b" min={0} max={255} step={1} value={[rgb.b]} onValueChange={([val]) => handleRgbChange('b', val)} />
                           <Input type="number" value={Math.round(rgb.b)} onChange={(e) => handleRgbChange('b', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="hsl" className="pt-4 space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="hsl-h">Hue</Label>
                        <div className="flex items-center gap-4">
                            <Slider id="hsl-h" min={0} max={360} step={1} value={[hsl.h]} onValueChange={([val]) => handleHslChange('h', val)} />
                            <Input type="number" value={hsl.h} onChange={(e) => handleHslChange('h', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hsl-s">Saturation</Label>
                        <div className="flex items-center gap-4">
                           <Slider id="hsl-s" min={0} max={100} step={1} value={[hsl.s]} onValueChange={([val]) => handleHslChange('s', val)} />
                           <Input type="number" value={hsl.s} onChange={(e) => handleHslChange('s', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hsl-l">Lightness</Label>
                        <div className="flex items-center gap-4">
                           <Slider id="hsl-l" min={0} max={100} step={1} value={[hsl.l]} onValueChange={([val]) => handleHslChange('l', val)} />
                           <Input type="number" value={hsl.l} onChange={(e) => handleHslChange('l', Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
           
            <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                    <Label>{t('favoriteColors')}</Label>
                    <Button variant="link" onClick={() => setIsEditingFavorites(!isEditingFavorites)}>
                        {isEditingFavorites ? t('save') : t('edit')}
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {favoriteColors.map((color) => (
                        <div key={color} className="relative group">
                            <button
                                type="button"
                                className="h-10 w-10 rounded-full border-2 transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSwatchClick(color)}
                                aria-label={t('selectColor') + ' ' + color}
                            />
                            {isEditingFavorites && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleRemoveFavorite(color)}>
                                    <Trash2 className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    <Button type="button" size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={handleAddFavorite}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                {isEditingFavorites && <p className="text-xs text-muted-foreground">{t('editFavoritesDescription')}</p>}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={() => onSave(selectedColor)}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
