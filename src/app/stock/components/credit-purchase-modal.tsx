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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, totalValue: number) => void;
  serverName: string;
}

export function CreditPurchaseModal({ isOpen, onClose, onConfirm, serverName }: CreditPurchaseModalProps) {
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = React.useState<number | ''>('');
  const [totalValue, setTotalValue] = React.useState('');
  const [unitValue, setUnitValue] = React.useState<number | null>(null);

  const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setTotalValue('');
      return;
    }
    const numericValue = parseInt(value, 10) / 100;
    setTotalValue(formatCurrency(numericValue));
  };
  
  React.useEffect(() => {
    const numericQuantity = Number(quantity);
    const numericValue = parseFloat(totalValue.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;

    if (numericQuantity > 0 && numericValue > 0) {
      setUnitValue(numericValue / numericQuantity);
    } else {
      setUnitValue(null);
    }
  }, [quantity, totalValue]);
  
  React.useEffect(() => {
    if (!isOpen) {
      setQuantity('');
      setTotalValue('');
      setUnitValue(null);
    }
  }, [isOpen]);

  const handleConfirmClick = () => {
    const numericQuantity = Number(quantity);
    const numericValue = parseFloat(totalValue.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;

    if (numericQuantity > 0 && numericValue > 0) {
      onConfirm(numericQuantity, numericValue);
    }
  };

  const isFormValid = Number(quantity) > 0 && (parseFloat(totalValue.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('buyCredits')}</DialogTitle>
          <DialogDescription>
            {t('addCreditsToServer', { serverName: serverName })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('quantityOfCredits')}</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 100"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalValue">{t('totalPurchaseValue')}</Label>
            <Input
              id="totalValue"
              value={totalValue}
              onChange={handleValueChange}
              placeholder={formatCurrency(0)}
              autoComplete="off"
            />
          </div>
          {unitValue !== null && (
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('unitValue')}</AlertTitle>
              <AlertDescription className="font-bold text-lg">
                {formatCurrency(unitValue)}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleConfirmClick} disabled={!isFormValid}>{t('confirmAndSave')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
