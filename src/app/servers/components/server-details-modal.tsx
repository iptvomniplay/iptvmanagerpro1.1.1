'use client';

import * as React from 'react';
import type { Server } from '@/lib/types';
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
import { Trash2, FilePenLine } from 'lucide-react';

interface ServerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | null; }) => {
  const displayValue = value ?? '-';
  if (value === null || value === undefined || value === '') return null;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{String(displayValue)}</p>
    </div>
  );
};

export function ServerDetailsModal({ isOpen, onClose, server, onEdit, onDelete }: ServerDetailsModalProps) {
  const { t } = useLanguage();

  if (!server) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{server.name}</DialogTitle>
          <DialogDescription>{server.url}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <h3 className="text-xl font-semibold text-primary">{t('panelDetails')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('responsibleName')} value={server.responsibleName} />
            <DetailItem label={t('nickname')} value={server.nickname} />
            <DetailItem label={t('phone')} value={server.phone} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('paymentMethod')}</p>
              <Badge variant={server.paymentType === 'prepaid' ? 'default' : 'secondary'} className="text-base mt-1">
                {t(server.paymentType as any)}
              </Badge>
            </div>

            {server.paymentType === 'postpaid' && (
              <>
                <DetailItem label={t('panelValue')} value={server.panelValue} />
                <DetailItem label={t('dueDate')} value={server.dueDate} />
              </>
            )}
             <DetailItem label={t('creditBalance')} value={server.creditStock || 0} />
          </div>

          {server.subServers && server.subServers.length > 0 && (
            <>
              <Separator />
              <h3 className="text-xl font-semibold text-primary">{t('subServerDetails')}</h3>
               <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('subServerName')}</TableHead>
                      <TableHead>{t('subServerType')}</TableHead>
                      <TableHead className="text-right">{t('subServerScreens')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server.subServers.map((sub, index) => (
                      <TableRow key={index}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.type}</TableCell>
                        <TableCell className="text-right">{sub.screens}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-6 justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('delete')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button onClick={onEdit}>
              <FilePenLine className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
