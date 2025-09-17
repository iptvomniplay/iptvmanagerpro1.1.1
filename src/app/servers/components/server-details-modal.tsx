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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, FilePenLine, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useData } from '@/hooks/use-data';

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
  const { updateServer } = useData();

  if (!server) return null;

  const getStatusVariant = (status: Server['status'] | SubServer['status']) => {
    switch (status) {
      case 'Online':
        return 'success';
      case 'Offline':
        return 'inactive';
      case 'Suspended':
        return 'destructive';
      case 'Maintenance':
        return 'warning';
      default:
        return 'outline';
    }
  };
  
  const handlePanelStatusChange = (newStatus: Server['status']) => {
    updateServer({ ...server, status: newStatus });
  };

  const handleSubServerStatusChange = (subServerName: string, newStatus: SubServer['status']) => {
    const updatedSubServers = server.subServers?.map(sub => 
      sub.name === subServerName ? { ...sub, status: newStatus } : sub
    );
    updateServer({ ...server, subServers: updatedSubServers });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{server.name}</DialogTitle>
          <DialogDescription>{server.url}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-4">
          <h3 className="text-xl font-semibold text-primary">{t('panelDetails')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label={t('responsibleName')} value={server.responsibleName} />
            <DetailItem label={t('nickname')} value={server.nickname} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {server.phones?.map((phone, index) => (
                  <Badge key={index} variant="outline" className="text-base">{phone.number}</Badge>
                ))}
              </div>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">{t('status')}</p>
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Badge variant={getStatusVariant(server.status)} className="cursor-pointer text-base mt-1">
                            {t(server.status.toLowerCase().replace(' ', '') as any)}
                        </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={() => handlePanelStatusChange('Online')}>{t('online')}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handlePanelStatusChange('Offline')}>{t('offline')}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handlePanelStatusChange('Suspended')}>{t('suspended')}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handlePanelStatusChange('Maintenance')}>{t('maintenance')}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
               <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-xl text-primary">
                    <div className="flex items-center gap-2">
                        <h3>{t('subServerDetails')}</h3>
                        <Badge variant="secondary">{server.subServers.length}</Badge>
                    </div>
                    <ChevronsUpDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-4">
                 {server.subServers.map((sub, index) => (
                    <Collapsible key={index} className="border rounded-lg">
                       <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-left">
                          <div className="flex items-center gap-4">
                            <span>{sub.name}</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Badge variant={getStatusVariant(sub.status)} className="cursor-pointer text-base">
                                        {t(sub.status.toLowerCase().replace(' ', '') as any)}
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Online')}>{t('online')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Offline')}>{t('offline')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Suspended')}>{t('suspended')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Maintenance')}>{t('maintenance')}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                       </CollapsibleTrigger>
                       <CollapsibleContent className="p-4 pt-0">
                           <div className="space-y-3 pt-4 border-t">
                              <DetailItem label={t('subServerType')} value={sub.type} />
                              <DetailItem label={t('screens')} value={sub.screens} />
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">{t('plans')}:</p>
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
