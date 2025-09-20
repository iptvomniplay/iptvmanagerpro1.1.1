'use client';

import * as React from 'react';
import type { Client, SelectedPlan, Application, Phone } from '@/lib/types';
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
import { BookText, ChevronsUpDown, AppWindow, FileText as FileTextIcon } from 'lucide-react';

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
  if (!value && value !== 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{String(value)}</p>
    </div>
  );
};


const PlanDetails = ({ plan }: { plan: SelectedPlan }) => {
    const { t } = useLanguage();
    const periodOptions: { value: SelectedPlan['planPeriod']; label: string }[] = [
        { value: '30d', label: '30 dias' }, { value: '3m', label: '3 meses' },
        { value: '6m', label: '6 meses' }, { value: '1y', label: '1 ano' },
    ];

    return (
        <div className="space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label={t('panel')} value={plan.panel.name} />
                <DetailItem label={t('servers')} value={plan.server.name} />
                <DetailItem label={t('plans')} value={plan.plan.name} />
                <DetailItem label={t('screens')} value={plan.screens} />
                <DetailItem label={t('planValue')} value={plan.isCourtesy ? t('courtesy') : plan.planValue} />
                <DetailItem label="Período" value={periodOptions.find(p => p.value === plan.planPeriod)?.label} />
                <DetailItem label={t('dueDate')} value={plan.dueDate} />
            </div>
            {plan.observations && (
                 <div className="mt-4 pt-4 border-t space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('observations')}</p>
                    <p className="text-base whitespace-pre-wrap text-card-foreground">{plan.observations}</p>
                </div>
            )}
        </div>
    )
}

const AppDetails = ({ app }: { app: Application }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label={t('appName')} value={app.name} />
                <DetailItem label={t('macAddress')} value={app.macAddress} />
                <DetailItem label={t('device')} value={app.device} />
                <DetailItem label={t('location')} value={app.location} />
                {app.isPreExisting ? (
                    <div className="col-span-full">
                        <Badge variant="outline">{t('pre-existing-app')}</Badge>
                    </div>
                ) : (
                    <>
                        <DetailItem label={t('keyId')} value={app.keyId} />
                        <DetailItem label={t('licenseType')} value={t(app.licenseType.toLowerCase() as any)} />
                        {app.licenseType === 'Anual' && <DetailItem label={t('licenseDueDate')} value={app.licenseDueDate} />}
                        <DetailItem label={t('activationId')} value={app.activationId} />
                        <DetailItem label={t('activationLocation')} value={app.activationLocation} />
                    </>
                )}
            </div>
            {app.hasResponsible && (
                 <div className="mt-4 pt-4 border-t space-y-4">
                    <h4 className="font-semibold">{t('responsibleAndPhone')}</h4>
                     <div className="grid grid-cols-2 gap-4">
                         <DetailItem label={t('responsibleName')} value={app.responsibleName} />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                            {app.responsiblePhones?.map((phone: Phone, index: number) => (
                                <Badge key={index} variant="outline" className="text-base">
                                {phone.number}
                                </Badge>
                            ))}
                            </div>
                        </div>
                     </div>
                 </div>
            )}
            {app.observations && (
                 <div className="mt-4 pt-4 border-t space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('observations')}</p>
                    <p className="text-base whitespace-pre-wrap text-card-foreground">{app.observations}</p>
                </div>
            )}
        </div>
    )
}

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{client.name}</DialogTitle>
          <DialogDescription>{t('clientDetails')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('fullName')} value={client.name} />
            <DetailItem label={t('nickname')} value={client.nickname} />
            <DetailItem label={t('emailAddress')} value={client.email} />
            <DetailItem label={t('birthDate')} value={client.birthDate} />
            <DetailItem label={t('clientID')} value={client.id || t('Sem ID')} />
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

           {client.plans && client.plans.length > 0 && (
            <>
                <Separator />
                <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-xl text-primary">
                      <div className="flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5" />
                          <h3>{t('subscriptionPlans')}</h3>
                          <Badge variant="secondary">{client.plans.length}</Badge>
                      </div>
                      <ChevronsUpDown className="h-5 w-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                        {client.plans.map((plan, index) => (
                            <Collapsible key={index} className="border rounded-lg bg-muted/50 p-4">
                                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
                                    <span>{plan.plan.name}</span>
                                    <ChevronsUpDown className="h-5 w-5" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 mt-4 border-t">
                                    <PlanDetails plan={plan} />
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            </>
          )}

          {client.applications && client.applications.length > 0 && (
            <>
                <Separator />
                <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-xl text-primary">
                      <div className="flex items-center gap-2">
                          <AppWindow className="h-5 w-5" />
                          <h3>{t('applications')}</h3>
                           <Badge variant="secondary">{client.applications.length}</Badge>
                      </div>
                      <ChevronsUpDown className="h-5 w-5" />
                    </CollapsibleTrigger>
                     <CollapsibleContent className="space-y-4 pt-4">
                        {client.applications.map((app, index) => (
                            <Collapsible key={index} className="border rounded-lg bg-muted/50 p-4">
                                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
                                    <span>{app.name}</span>
                                    <ChevronsUpDown className="h-5 w-5" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 mt-4 border-t">
                                    <AppDetails app={app} />
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
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
