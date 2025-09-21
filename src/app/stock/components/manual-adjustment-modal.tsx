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
import { Textarea } from '@/components/ui/textarea';

interface ManualAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, description: string) => void;
}

export function ManualAdjustmentModal({ isOpen, onClose, onConfirm }: ManualAdjustmentModalProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = React.useState<number | ''>('');
  const [description, setDescription] = React.useState('');

  const handleConfirmClick = () => {
    const numericQuantity = Number(quantity);
    if (numericQuantity !== 0 && description) {
      onConfirm(numericQuantity, description);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      setQuantity('');
      setDescription('');
    }
  }, [isOpen]);

  const isFormValid = Number(quantity) !== 0 && description.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('manualAdjustment')}</DialogTitle>
          <DialogDescription>
            {t('manualAdjustmentDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('adjustmentQuantity')}</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 10 ou -5"
              autoComplete="off"
            />
             <p className="text-xs text-muted-foreground">{t('adjustmentQuantityDescription')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('adjustmentDescriptionPlaceholder')}
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleConfirmClick} disabled={!isFormValid}>{t('confirmAndSave')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
