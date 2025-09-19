'use client';

import * as React from 'react';
import type { ClientFormValues } from './client-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientData: ClientFormValues;
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | null; }) => {
  if (!value) return null;
  
  let displayValue = String(value);

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{displayValue}</p>
    </div>
  );
};

export function ConfirmationModal({ isOpen, onClose, onConfirm, clientData }: ConfirmationModalProps) {
  const { t } = useLanguage();

  const getStatusVariant = (status?: 'Active' | 'Inactive' | 'Expired' | 'Test') => {
    if (!status) return 'outline';
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'inactive';
      case 'Expired':
        return 'destructive';
      case 'Test':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('reviewClientRegistration')}</DialogTitle>
          <DialogDescription>{t('reviewRegistrationDescription')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <h3 className="text-xl font-semibold text-primary">{t('clientDetails')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('fullName')} value={clientData.name} />
            <DetailItem label={t('nickname')} value={clientData.nickname} />
            <DetailItem label={t('emailAddress')} value={clientData.email} />
            <DetailItem label={t('birthDate')} value={clientData.birthDate} />
             <div>
              <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {clientData.phones?.map((phone, index) => (
                  <Badge key={index} variant="outline" className="text-base">{phone.number}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('clientStatus')}</p>
              {clientData.status && (
                <Badge variant={getStatusVariant(clientData.status)} className="text-base mt-1">
                    {t(clientData.status.toLowerCase() as any)}
                </Badge>
              )}
            </div>
          </div>
            {clientData.observations && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">{t('observations')}</h3>
                <p className="text-base text-muted-foreground whitespace-pre-wrap">{clientData.observations}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onClose}>
            {t('backToEdit')}
          </Button>
          <Button onClick={onConfirm}>{t('confirmAndSave')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
