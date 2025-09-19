'use client';

import * as React from 'react';
import type { Client } from '@/lib/types';
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
import { Trash2, FilePenLine } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { BookText, ChevronsUpDown } from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  if (!value) return null;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{String(value)}</p>
    </div>
  );
};

export function ClientDetailsModal({
  isOpen,
  onClose,
  client,
  onEdit,
  onDelete,
}: ClientDetailsModalProps) {
  const { t } = useLanguage();

  if (!client) return null;

  const getStatusVariant = (status: Client['status']) => {
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{client.name}</DialogTitle>
          <DialogDescription>{t('clientDetails')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('fullName')} value={client.name} />
            <DetailItem label={t('nickname')} value={client.nickname} />
            <DetailItem label={t('emailAddress')} value={client.email} />
            <DetailItem label={t('birthDate')} value={client.birthDate} />
            <DetailItem label={t('clientID')} value={client.id} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('phone')}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {client.phones?.map((phone, index) => (
                  <Badge key={index} variant="outline" className="text-base">
                    {phone.number}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('clientStatus')}
              </p>
              <Badge
                variant={getStatusVariant(client.status)}
                className="text-base mt-1"
              >
                {t(client.status.toLowerCase() as any)}
              </Badge>
            </div>
          </div>
          <Separator />
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-xl text-primary">
              <div className="flex items-center gap-2">
                <BookText className="h-5 w-5" />
                <h3>{t('observations')}</h3>
              </div>
              <ChevronsUpDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <Textarea
                value={client.observations || ''}
                readOnly
                placeholder={t('observationsPlaceholder')}
                className="min-h-[120px] text-base"
                autoComplete="off"
              />
            </CollapsibleContent>
          </Collapsible>
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
