'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

interface AddServerModalProps {
  isOpen: boolean;
  onResponse: (addMore: boolean) => void;
}

export function AddServerModal({ isOpen, onResponse }: AddServerModalProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{t('addMoreServerTitle')}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {t('addMoreServerDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onResponse(false)}>
            {t('no')}
          </Button>
          <Button onClick={() => onResponse(true)}>{t('yes')}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
