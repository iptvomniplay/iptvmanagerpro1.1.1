'use client';

import * as React from 'react';
import type { Phone } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { X } from 'lucide-react';

interface PhoneInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phones: Phone[]) => void;
  initialPhones: Phone[];
}

export function PhoneInputModal({ isOpen, onClose, onSave, initialPhones }: PhoneInputModalProps) {
  const { t } = useLanguage();
  const [phones, setPhones] = React.useState<Phone[]>(initialPhones);
  const [phoneType, setPhoneType] = React.useState<'celular' | 'fixo' | 'ddi'>('celular');
  const [currentPhone, setCurrentPhone] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setPhones(initialPhones);
      setCurrentPhone('');
      setPhoneType('celular');
    }
  }, [isOpen, initialPhones]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (phoneType !== 'ddi') {
        value = value.replace(/\D/g, '');
    }

    let formattedValue = value;

    if (phoneType === 'celular') {
        formattedValue = value.slice(0, 11);
        if (formattedValue.length > 2) {
            formattedValue = `(${formattedValue.substring(0, 2)}) ${formattedValue.substring(2, 7)}`;
            if (value.length > 7) {
                formattedValue += `-${value.substring(7, 11)}`;
            }
        } else if (value.length > 0) {
            formattedValue = `(${value}`;
        }
    } else if (phoneType === 'fixo') {
        formattedValue = value.slice(0, 10);
        if (value.length > 2) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 6)}`;
            if (value.length > 6) {
                formattedValue += `-${value.substring(6, 10)}`;
            }
        } else if (value.length > 0) {
            formattedValue = `(${value}`;
        }
    }
    
    setCurrentPhone(formattedValue);
  };
  
  const handleAddPhone = () => {
    if (currentPhone.trim()) {
      setPhones(prev => [...prev, { type: phoneType, number: currentPhone.trim() }]);
      setCurrentPhone('');
    }
  };

  const handleRemovePhone = (index: number) => {
    setPhones(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = () => {
    onSave(phones);
  };

  const phonePlaceholders = {
    celular: 'Ex: (11) 91234-5678',
    fixo: 'Ex: (11) 3456-7890',
    ddi: 'Ex: +1 202-555-0198'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('managePhones')}</DialogTitle>
          <DialogDescription>{t('managePhonesDescription')}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className='space-y-2'>
            <Label>{t('phoneType')}</Label>
            <RadioGroup
                value={phoneType}
                onValueChange={(value) => setPhoneType(value as any)}
                className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="celular" id="celular"/>
                <Label htmlFor="celular" className="font-normal">{t('mobile')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixo" id="fixo"/>
                <Label htmlFor="fixo" className="font-normal">{t('landline')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ddi" id="ddi"/>
                <Label htmlFor="ddi" className="font-normal">{t('ddi')}</Label>
              </div>
            </RadioGroup>
          </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  value={currentPhone}
                  onChange={handlePhoneInputChange}
                  placeholder={phonePlaceholders[phoneType]}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhone();
                      }
                  }}
                />
              </div>
              <Button type="button" onClick={handleAddPhone}>{t('insert')}</Button>
            </div>
          
            <div className="space-y-2">
                <Label>{t('addedPhones')}</Label>
                <div className="flex flex-col gap-2 p-2 rounded-md border min-h-[40px]">
                    {phones.length > 0 ? phones.map((phone, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center justify-between text-base">
                        <span>{phone.number}</span>
                        <button type="button" onClick={() => handleRemovePhone(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                        </Badge>
                    )) : <p className="text-sm text-muted-foreground px-2">{t('noPhonesAdded')}</p>}
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('savePhones')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
