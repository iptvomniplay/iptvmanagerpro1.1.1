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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ManualAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, description: string) => void;
}

export function ManualAdjustmentModal({ isOpen, onClose, onConfirm }: ManualAdjustmentModalProps) {
  const { t } = useLanguage();
  const [adjustmentType, setAdjustmentType] = React.useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = React.useState<number | ''>('');
  const [description, setDescription] = React.useState('');

  const handleConfirmClick = () => {
    const numericQuantity = Number(quantity);
    if (numericQuantity > 0 && description) {
      const finalQuantity = adjustmentType === 'add' ? numericQuantity : -numericQuantity;
      onConfirm(finalQuantity, description);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      setQuantity('');
      setDescription('');
      setAdjustmentType('add');
    }
  }, [isOpen]);

  const isFormValid = Number(quantity) > 0 && description.trim() !== '';

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
             <Label>{t('type')}</Label>
              <RadioGroup
                  value={adjustmentType}
                  onValueChange={(value) => setAdjustmentType(value as 'add' | 'remove')}
                  className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add"/>
                  <Label htmlFor="add" className="font-normal cursor-pointer">{t('add')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove"/>
                  <Label htmlFor="remove" className="font-normal cursor-pointer">{t('delete')}</Label>
                </div>
              </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('quantityOfCredits')}</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 10"
              autoComplete="off"
            />
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
