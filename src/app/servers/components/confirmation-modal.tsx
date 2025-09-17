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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [openStates, setOpenStates] = React.useState<Record<string, boolean>>({});

  const toggleOpen = (name: string) => {
    setOpenStates(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('reviewRegistration')}</DialogTitle>
          <DialogDescription>{t('reviewRegistrationDescription')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <h3 className="text-xl font-semibold text-primary">{t('registeredPanel')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('serverName')} value={serverData.name} />
            <DetailItem label={t('panelUrl')} value={serverData.url} />
            <DetailItem label={t('responsibleName')} value={serverData.responsibleName} />
            <DetailItem label={t('nickname')} value={serverData.nickname} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {serverData.phones?.map((phone, index) => (
                  <Badge key={index} variant="outline" className="text-base">{phone.number}</Badge>
                ))}
              </div>
            </div>
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
              <h3 className="text-xl font-semibold text-primary">{t('registeredServers')}</h3>
               <div className="space-y-2">
                {serverData.subServers.map((sub, index) => (
                  <Collapsible
                    key={index}
                    open={openStates[sub.name] || false}
                    onOpenChange={() => toggleOpen(sub.name)}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-semibold">
                      <span>{sub.name}</span>
                      {openStates[sub.name] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0">
                        <div className="space-y-3 pt-3 border-t">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">{t('subServerType')}:</p>
                                <p>{sub.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">{t('screens')}:</p>
                                <p>{sub.screens}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">{t('plans')}:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {sub.plans.map((plan, planIndex) => (
                                        <Badge key={planIndex} variant="outline">{plan}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
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
