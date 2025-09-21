'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CashFlowEntry } from '@/lib/types';
import { z } from 'zod';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowEntry, 'id' | 'date'>) => void;
  type: 'income' | 'expense';
}

export function EntryModal({ isOpen, onClose, onSave, type }: EntryModalProps) {
  const { t, language } = useLanguage();
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [errors, setErrors] = React.useState<{ description?: string; amount?: string }>({});

  const formSchema = z.object({
    description: z.string().min(1, t('fieldRequired')),
    amount: z.string().refine(val => {
        const num = parseFloat(val.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0;
        return num > 0;
    }, { message: t('valueMustBePositive') }),
  });


  React.useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setAmount('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = () => {
    const result = formSchema.safeParse({ description, amount });
    
    if (!result.success) {
      const newErrors: { description?: string; amount?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path.includes('description')) newErrors.description = err.message;
        if (err.path.includes('amount')) newErrors.amount = err.message;
      });
      setErrors(newErrors);
      return;
    }

    const numericAmount = parseFloat(amount.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0;

    onSave({
      description,
      amount: numericAmount,
      type,
    });
  };
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (!value) {
      setAmount('');
      return;
    }
    const numericValue = parseInt(value, 10) / 100;

    const formatter = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: language === 'pt-BR' ? 'BRL' : 'USD',
    });
    setAmount(formatter.format(numericValue));
    if (errors.amount) {
        setErrors(prev => ({...prev, amount: undefined}));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addManualEntry')}</DialogTitle>
          <DialogDescription>{t('addManualEntryDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t('entryType')}</Label>
            <p className={`font-semibold text-lg ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
              {t(type)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('entryDescription')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                    setErrors(prev => ({...prev, description: undefined}));
                }
              }}
              placeholder={t('entryDescriptionPlaceholder')}
              autoComplete="off"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{t('entryValue')}</Label>
            <Input
              id="amount"
              value={amount}
              onChange={handleCurrencyChange}
              placeholder={language === 'pt-BR' ? 'R$ 0,00' : '$ 0.00'}
              autoComplete="off"
            />
             {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('confirmAndSave')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
