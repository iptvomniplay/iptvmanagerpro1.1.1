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
  onConfirm: (quantity: number, description: string, totalValue: number) => void;
}

export function ManualAdjustmentModal({ isOpen, onClose, onConfirm }: ManualAdjustmentModalProps) {
  const { t, language } = useLanguage();
  const [adjustmentType, setAdjustmentType] = React.useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = React.useState<number | ''>('');
  const [description, setDescription] = React.useState('');
  const [totalValue, setTotalValue] = React.useState('');

   const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9-]/g, '');
    if (!value || value === '-') {
      setTotalValue(value);
      return;
    }
    const isNegative = value.startsWith('-');
    const numericPart = value.replace(/-/g, '');
    if (!numericPart) {
      setTotalValue(isNegative ? '-' : '');
      return;
    }
    const numericValue = parseInt(numericPart, 10) / 100;
    setTotalValue((isNegative ? '-' : '') + formatCurrency(numericValue));
  };


  const handleConfirmClick = () => {
    const numericQuantity = Number(quantity);
    const numericValue = parseFloat(totalValue.replace(/[^0-9,.-]+/g, "").replace(',', '.')) || 0;
    
    if (description.trim() && (numericQuantity !== 0 || numericValue !== 0)) {
      const finalQuantity = adjustmentType === 'add' ? numericQuantity : -numericQuantity;
      onConfirm(finalQuantity, description, numericValue);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      setQuantity('');
      setDescription('');
      setAdjustmentType('add');
      setTotalValue('');
    }
  }, [isOpen]);

  const isFormValid = description.trim() !== '' && (Number(quantity) !== 0 || (parseFloat(totalValue.replace(/[^0-9,.-]+/g, "").replace(',', '.')) || 0) !== 0);


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
             <p className="text-xs text-muted-foreground">{t('adjustmentQuantityDescription')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalValue">{t('Valor do Ajuste (R$)')}</Label>
            <Input
              id="totalValue"
              value={totalValue}
              onChange={handleValueChange}
              placeholder={formatCurrency(0)}
              autoComplete="off"
            />
             <p className="text-xs text-muted-foreground">{t('adjustmentValueDescription')}</p>
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
        </Dialog