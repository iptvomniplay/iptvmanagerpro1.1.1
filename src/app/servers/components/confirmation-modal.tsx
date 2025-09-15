'use client';

import * as React from 'react';
import type { Server, SubServer } from '@/lib/types';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serverData: Partial<Server>;
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | null; }) => {
  const displayValue = value ?? 0;
  
  if (!value && value !== 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{String(displayValue)}</p>
    </div>
  );
};

export function ConfirmationModal({ isOpen, onClose, onConfirm, serverData }: ConfirmationModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('reviewRegistration')}</DialogTitle>
          <DialogDescription>{t('reviewRegistrationDescription')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <h3 className="text-xl font-semibold text-primary">{t('panelDetails')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('serverName')} value={serverData.name} />
            <DetailItem label={t('panelUrl')} value={serverData.url} />
            <DetailItem label={t('responsibleName')} value={serverData.responsibleName} />
            <DetailItem label={t('nickname')} value={serverData.nickname} />
            <DetailItem label={t('phone')} value={serverData.phone} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('paymentMethod')}</p>
              <Badge variant={serverData.paymentType === 'prepaid' ? 'default' : 'secondary'} className="text-base mt-1">
                {t(serverData.paymentType as any)}
              </Badge>
            </div>

            {serverData.paymentType === 'postpaid' && (
              <>
                <DetailItem label={t('panelValue')} value={serverData.panelValue} />
                <DetailItem label={t('dueDate')} value={serverData.dueDate} />
              </>
            )}
             <DetailItem label={t('creditBalance')} value={serverData.creditStock} />
          </div>

          {serverData.subServers && serverData.subServers.length > 0 && (
            <>
              <Separator />
              <h3 className="text-xl font-semibold text-primary">{t('subServerDetails')}</h3>
               <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('subServerName')}</TableHead>
                      <TableHead>{t('subServerType')}</TableHead>
                      <TableHead>{t('plans')}</TableHead>
                      <TableHead className="text-right">{t('subServerScreens')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serverData.subServers.map((sub, index) => (
                      <TableRow key={index}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.type}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {sub.plans.map((plan, planIndex) => (
                                <Badge key={planIndex} variant="outline">{plan}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{sub.screens}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
