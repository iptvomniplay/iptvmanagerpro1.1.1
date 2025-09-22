'use client';

import * as React from 'react';
import type { Server, SubServer, ServerRating } from '@/lib/types';
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
import { Trash2, FilePenLine, ChevronRight, ChevronsUpDown, Eye, EyeOff, BookText, Calendar, Settings, Star, Smile } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useData } from '@/hooks/use-data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, set, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hover, setHover] = React.useState(0);
  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        const color = colors[ratingValue - 1];

        return (
          <button
            type="button"
            key={ratingValue}
            className="focus:outline-none"
            onClick={(e) => { e.stopPropagation(); onRatingChange(ratingValue); }}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className="h-7 w-7 transition-colors"
              fill={(ratingValue <= (hover || rating)) ? color : 'hsl(var(--muted))'}
              stroke={(ratingValue <= (hover || rating)) ? color : 'hsl(var(--foreground))'}
            />
          </button>
        );
      })}
    </div>
  );
};


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

const PasswordDisplay = ({ password }: { password?: string }) => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = React.useState(false);

    if (!password) return null;
    
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{t('password')}</p>
            <div className="flex items-center gap-2">
                <Input
                    type={isVisible ? 'text' : 'password'}
                    value={password}
                    readOnly
                    className="text-lg border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoComplete="off"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    )
}

export function ServerDetailsModal({ isOpen, onClose, server: initialServer, onEdit, onDelete }: ServerDetailsModalProps) {
  const { t } = useLanguage();
  const { servers, updateServer } = useData();
  const router = useRouter();

  // Find the most up-to-date server data from the global context
  const server = servers.find(s => s.id === initialServer?.id) || initialServer;

  const [observations, setObservations] = React.useState(server?.observations || '');

  React.useEffect(() => {
    if (server) {
      setObservations(server.observations || '');
    }
  }, [server]);


  if (!server) return null;

  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservations(e.target.value);
  };

  const handleObservationsBlur = () => {
    if (server && server.observations !== observations) {
      updateServer({ ...server, observations });
    }
  };


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
  
  const getNextDueDate = () => {
    if (server.paymentType !== 'postpaid' || !server.dueDate) return null;

    const today = new Date();
    let nextDueDate = set(today, { date: server.dueDate });

    if (isBefore(nextDueDate, today)) {
        nextDueDate = set(new Date(today.getFullYear(), today.getMonth() + 1, 1), { date: server.dueDate });
    }

    return format(nextDueDate, 'dd/MM/yyyy');
  };

  const handleRatingChange = (category: keyof ServerRating, rating: number) => {
    const newRatings: ServerRating = {
      content: 0,
      support: 0,
      stability: 0,
      value: 0,
      ...server?.ratings,
      [category]: rating
    };
    updateServer({ ...server, ratings: newRatings });
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{server.name}</DialogTitle>
          <DialogDescription>{t('panelDetails')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="col-span-2 md:col-span-3">
              <DetailItem label={t('panelUrl')} value={server.url} />
            </div>
            <DetailItem label={t('login')} value={server.login} />
            <PasswordDisplay password={server.password} />
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
          </div>
          
          <Separator />
          <h3 className="text-xl font-semibold text-primary">{t('responsibleName')}</h3>
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
          </div>
          
          <Separator />
          <h3 className="text-xl font-semibold text-primary">{t('paymentDetails')}</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             <div>
              <p className="text-sm font-medium text-muted-foreground">{t('paymentMethod')}</p>
              <Badge variant={server.paymentType === 'prepaid' ? 'default' : 'secondary'} className="text-base mt-1">
                {t(server.paymentType as any)}
              </Badge>
            </div>
            {server.paymentType === 'postpaid' ? (
              <>
                <DetailItem label={t('panelValue')} value={server.panelValue} />
                <DetailItem label={t('dueDate')} value={server.dueDate} />
                <div className="p-3 bg-muted/50 rounded-lg border border-dashed col-span-full animate-in fade-in-50">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <p className="font-semibold text-base">{t('nextDueDate')}: <span className="font-bold">{getNextDueDate()}</span></p>
                    </div>
                </div>
              </>
            ) : (
                 <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-muted-foreground">{t('creditBalance')}</p>
                    <p className="text-4xl font-bold">{server.creditStock || 0}</p>
                </div>
            )}
           </div>

           <Separator />
           <Collapsible>
             <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-xl text-primary">
               <div className="flex items-center gap-2">
                 <Smile className="h-5 w-5" />
                 <h3>{t('Avaliações')}</h3>
               </div>
               <ChevronsUpDown className="h-5 w-5" />
             </CollapsibleTrigger>
             <CollapsibleContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-base font-semibold">{t('Conteúdo')}</span>
                    <StarRating rating={server.ratings?.content || 0} onRatingChange={(rating) => handleRatingChange('content', rating)} />
                </div>
                 <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-base font-semibold">{t('Suporte')}</span>
                    <StarRating rating={server.ratings?.support || 0} onRatingChange={(rating) => handleRatingChange('support', rating)} />
                </div>
                 <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-base font-semibold">{t('Estabilidade')}</span>
                    <StarRating rating={server.ratings?.stability || 0} onRatingChange={(rating) => handleRatingChange('stability', rating)} />
                </div>
                 <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-base font-semibold">{t('Valor')}</span>
                    <StarRating rating={server.ratings?.value || 0} onRatingChange={(rating) => handleRatingChange('value', rating)} />
                </div>
             </CollapsibleContent>
           </Collapsible>


          {server.subServers && server.subServers.length > 0 && (
            <>
              <Separator />
               <Collapsible defaultOpen={false}>
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
                          <span className="truncate mr-4">{sub.name}</span>
                          <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Badge variant={getStatusVariant(sub.status)} className="cursor-pointer text-base">
                                        {t(sub.status.toLowerCase().replace(' ', '') as any)}
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Online')}>{t('online')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Offline')}>{t('offline')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Suspended')}>{t('suspended')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSubServerStatusChange(sub.name, 'Maintenance')}>{t('maintenance')}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90 shrink-0" />
                          </div>
                       </CollapsibleTrigger>
                       <CollapsibleContent className="p-4 pt-0">
                           <div className="space-y-3 pt-4 border-t">
                              <DetailItem label={t('subServerType')} value={sub.type} />
                              <DetailItem label={t('screens')} value={sub.screens} />
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">{t('plans')}:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                      {sub.plans.map((plan, planIndex) => (
                                          <Badge key={planIndex} variant="outline">{plan.name}</Badge>
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
                    value={observations}
                    onChange={handleObservationsChange}
                    onBlur={handleObservationsBlur}
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
