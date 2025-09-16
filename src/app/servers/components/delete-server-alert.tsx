'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/use-language';

interface DeleteServerAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serverName: string;
}

export function DeleteServerAlert({ isOpen, onClose, onConfirm, serverName }: DeleteServerAlertProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{t('areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteServerWarning')}{' '}
            <span className="font-semibold">{serverName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
