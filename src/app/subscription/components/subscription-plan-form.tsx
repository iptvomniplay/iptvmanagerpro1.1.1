'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import type { Server, SubServer, PlanType as PlanType, Client, SelectedPlan, PlanPeriod, PlanStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { X, Calendar as CalendarIcon, FilePenLine, PlusCircle, Eye, AlertTriangle, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { add, format, lastDayOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SubscriptionPlanFormProps {
    selectedClient: Client | null;
    onPlanChange: (plans: SelectedPlan[]) => void;
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg">{String(value)}</p>
    </div>
  );
};

const ValueDisplay = ({ value, isCourtesy }: { value?: number; isCourtesy?: boolean }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = React.useState(false);

  const formatCurrency = (val: number) => {
    const currency = t('currency') === 'BRL' ? 'BRL' : 'USD';
    const locale = t('currency') === 'BRL' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(val);
  };

  if (value === undefined && !isCourtesy) return null;

  const displayContent = () => {
    if (!isVisible) return '•••••';
    if (isCourtesy) {
      return (
        <Badge variant="default" className="text-base">
          {t('courtesy')}
        </Badge>
      );
    }
    return formatCurrency(value!);
  };

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{t('value')}</p>
      <div className="flex items-center gap-2">
        <div className="text-lg">{displayContent()}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export function SubscriptionPlanForm({ selectedClient, onPlanChange }: SubscriptionPlanFormProps) {
  const { t, language } = useLanguage();
  const { servers: panels } = useData();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = React.useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [planToShowDetails, setPlanToShowDetails] = React.useState<SelectedPlan | null>(null);

  const [selectedPanelId, setSelectedPanelId] = React.useState<string>('');
  const [selectedServerName, setSelectedServerName] = React.useState<string>('');
  const [selectedPlanName, setSelectedPlanName] = React.useState<string>('');
  const [numberOfScreens, setNumberOfScreens] = React.useState<number | ''>('');
  const [planPeriod, setPlanPeriod] = React.useState<PlanPeriod | undefined>();
  const [dueDate, setDueDate] = React.useState<number | undefined>();
  const [planValue, setPlanValue] = React.useState('');
  const [isCourtesy, setIsCourtesy] = React.useState(false);
  const [nextDueDate, setNextDueDate] = React.useState<Date | null>(null);

  const selectedPanel = panels.find((p) => p.id === selectedPanelId);
  const availableServers = selectedPanel?.subServers || [];
  const selectedServer = availableServers.find((s) => s.name === selectedServerName);
  const availablePlans = selectedServer?.plans || [];
  const selectedPlan = availablePlans.find((p) => p.name === selectedPlanName);
  
  const isFormValid = !!(selectedPanel && selectedServer && selectedPlan && numberOfScreens && selectedClient && planPeriod && dueDate && (planValue || isCourtesy));

  const resetForm = () => {
    setSelectedPanelId('');
    setSelectedServerName('');
    setSelectedPlanName('');
    setNumberOfScreens('');
    setPlanPeriod(undefined);
    setDueDate(undefined);
    setPlanValue('');
    setIsCourtesy(false);
    setNextDueDate(null);
    setEditingPlanIndex(null);
  };
  
  const handleOpenForm = (index: number | null = null) => {
    resetForm();
    if (index !== null && selectedClient?.plans) {
        const planToEdit = selectedClient.plans[index];
        setEditingPlanIndex(index);
        
        setSelectedPanelId(planToEdit.panel.id);
        
        setTimeout(() => {
            setSelectedServerName(planToEdit.server.name);
            setTimeout(() => {
                setSelectedPlanName(planToEdit.plan.name);
            }, 0);
        }, 0);
        
        setNumberOfScreens(planToEdit.screens);
        setPlanPeriod(planToEdit.planPeriod);
        setDueDate(planToEdit.dueDate);
        setPlanValue(formatCurrency(planToEdit.planValue));
        setIsCourtesy(planToEdit.isCourtesy);
    }
    setIsFormOpen(true);
  };

  const handleShowDetails = (plan: SelectedPlan) => {
    setPlanToShowDetails(plan);
    setIsDetailsModalOpen(true);
  };

  React.useEffect(() => {
    if (selectedPlan && selectedPlan.value && editingPlanIndex === null) {
      setPlanValue(formatCurrency(selectedPlan.value));
    } else if (editingPlanIndex === null) {
      setPlanValue('');
    }
  }, [selectedPlan, language, editingPlanIndex]);
  
  React.useEffect(() => {
    if (isCourtesy) {
      setPlanValue(formatCurrency(0));
    } else if (selectedPlan?.value && editingPlanIndex === null) {
      setPlanValue(formatCurrency(selectedPlan.value));
    }
  }, [isCourtesy, language, selectedPlan, editingPlanIndex]);

  React.useEffect(() => {
    if (!planPeriod || !dueDate) {
      setNextDueDate(null);
      return;
    }

    const now = new Date();
    let calculatedDate: Date;

    switch (planPeriod) {
      case '30d': calculatedDate = add(now, { days: 30 }); break;
      case '3m': calculatedDate = add(now, { months: 3 }); break;
      case '6m': calculatedDate = add(now, { months: 6 }); break;
      case '1y': calculatedDate = add(now, { years: 1 }); break;
      default: setNextDueDate(null); return;
    }
    
    const targetMonth = calculatedDate.getMonth();
    const targetYear = calculatedDate.getFullYear();
    const lastDay = lastDayOfMonth(new Date(targetYear, targetMonth)).getDate();
    const finalDay = Math.min(dueDate, lastDay);
    
    calculatedDate.setDate(finalDay);
    setNextDueDate(calculatedDate);
  }, [planPeriod, dueDate]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) { setPlanValue(''); return; }
    const numericValue = parseInt(value, 10) / 100;
    setPlanValue(formatCurrency(numericValue));
  };

  const getPlanStatus = (plan: SelectedPlan, client: Client): PlanStatus => {
    const planId = `${plan.panel.id}-${plan.server.name}-${plan.plan.name}`;
    const configuredAppsForPlan = client.applications?.filter(
      app => app.planId === planId
    ).length || 0;
    
    if (configuredAppsForPlan < plan.screens) {
        return 'Pending';
    }
    
    if (client.status === 'Expired') return 'Expired';
    if (client.status === 'Inactive') return 'Blocked';
    
    return 'Active';
  }

  const handleAddOrUpdatePlan = () => {
    if (selectedPanel && selectedServer && selectedPlan && numberOfScreens && selectedClient && planPeriod) {
      const numericValue = parseFloat(planValue.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0;
      const newPlan: SelectedPlan = {
          panel: selectedPanel, server: selectedServer, plan: selectedPlan,
          screens: numberOfScreens, planValue: isCourtesy ? 0 : numericValue,
          isCourtesy: isCourtesy, planPeriod: planPeriod, dueDate: dueDate,
      };
      
      let newPlans: SelectedPlan[];
      if (editingPlanIndex !== null) {
        newPlans = [...(selectedClient.plans || [])];
        newPlans[editingPlanIndex] = newPlan;
      } else {
        newPlans = [...(selectedClient.plans || []), newPlan];
      }

      onPlanChange(newPlans);
      setIsFormOpen(false);
    }
  };

  const handleRemovePlan = (indexToRemove: number) => {
    if (selectedClient && selectedClient.plans) {
      const newPlans = selectedClient.plans.filter((_, index) => index !== indexToRemove);
      onPlanChange(newPlans);
    }
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }

  const periodOptions: { value: PlanPeriod; label: string }[] = [
    { value: '30d', label: '30 dias' }, { value: '3m', label: '3 meses' },
    { value: '6m', label: '6 meses' }, { value: '1y', label: '1 ano' },
  ];

  const getPendingScreensCount = (plan: SelectedPlan) => {
    const planId = `${plan.panel.id}-${plan.server.name}-${plan.plan.name}`;
    const configuredAppsForPlan = selectedClient?.applications?.filter(
      app => app.planId === planId
    ).length || 0;
    return plan.screens - configuredAppsForPlan;
  };
  
  const getStatusVariant = (status?: PlanStatus) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Expired':
      case 'Blocked': return 'destructive';
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-4">
      <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>{t('addedPlans')}</CardTitle>
            <Button onClick={() => handleOpenForm(null)} disabled={!selectedClient}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addPlan')}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedClient?.plans && selectedClient.plans.length > 0 ? (
                <div className="space-y-3">
                    {selectedClient.plans.map((item, index) => {
                       const status = getPlanStatus(item, selectedClient);
                       return (
                          <Card key={index} className="bg-muted/50 cursor-pointer" onClick={() => handleShowDetails({...item, status})}>
                            <CardHeader className="flex flex-row items-start justify-between p-4">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">{item.plan.name}</CardTitle>
                                <CardDescription>{item.panel.name} / {item.server.name}</CardDescription>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); handleOpenForm(index); }}>
                                    <FilePenLine className="h-5 w-5" />
                                    <span className="sr-only">{t('edit')}</span>
                                </Button>
                                <Button variant="destructive" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); handleRemovePlan(index);}}>
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">{t('delete')}</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-base text-muted-foreground">
                               <div className="flex justify-between items-center">
                                  <div>
                                      <span className="font-semibold text-card-foreground">{t('screens')}: </span>
                                      <Badge variant="secondary" className="text-base">{item.screens}</Badge>
                                  </div>
                                  <Badge variant={getStatusVariant(status)} className="text-base">
                                      {t(status.toLowerCase() as any)}
                                  </Badge>
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <span className="font-semibold text-card-foreground">{t('value')}: </span>
                                      <ValueDisplay value={item.planValue} isCourtesy={item.isCourtesy} />
                                  </div>
                               </div>
                            </CardContent>
                          </Card>
                       )
                    })}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>{!selectedClient ? t('selectClientPrompt') : t('noSubServers')}</p>
                </div>
            )}
          </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>{editingPlanIndex !== null ? 'Editar Plano' : t('addPlan')}</DialogTitle>
                  <DialogDescription>
                      {editingPlanIndex !== null ? 'Altere os detalhes do plano abaixo.' : 'Preencha os detalhes do novo plano.'}
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('panel')}</Label>
                  <Select value={selectedPanelId} onValueChange={setSelectedPanelId} disabled={!selectedClient}>
                    <SelectTrigger><SelectValue placeholder={t('selectPanel')} /></SelectTrigger>
                    <SelectContent>{panels.map((panel) => (<SelectItem key={panel.id} value={panel.id}>{panel.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('servers')}</Label>
                  <Select value={selectedServerName} onValueChange={setSelectedServerName} disabled={!selectedPanelId}>
                    <SelectTrigger><SelectValue placeholder={t('select')} /></SelectTrigger>
                    <SelectContent>{availableServers.map((server) => (<SelectItem key={server.name} value={server.name}>{server.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>{t('screensAvailable')}</Label>
                        <div className="h-11 w-full rounded-md border border-input bg-muted px-4 py-2 text-base font-bold text-center flex items-center justify-center">
                            {selectedServer ? selectedServer.screens : '-'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor='screens-to-hire'>{t('screensToHire')}</Label>
                        <Select onValueChange={(value) => setNumberOfScreens(parseInt(value, 10))} disabled={!selectedServer} value={numberOfScreens ? String(numberOfScreens) : ''}>
                            <SelectTrigger id="screens-to-hire"><SelectValue placeholder={t('screensToHirePlaceholder')} /></SelectTrigger>
                            <SelectContent>{selectedServer && Array.from({ length: selectedServer.screens }, (_, i) => i + 1).map((num) => (<SelectItem key={num} value={String(num)}>{num}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('plans')}</Label>
                  <Select value={selectedPlanName} onValueChange={setSelectedPlanName} disabled={!selectedServerName}>
                    <SelectTrigger><SelectValue placeholder={t('select')} /></SelectTrigger>
                    <SelectContent>{availablePlans.map((plan) => (<SelectItem key={plan.name} value={plan.name}>{plan.name} {plan.value ? `(${formatCurrency(plan.value)})` : ''}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="plan-period">Período do Plano</Label>
                    <Select value={planPeriod} onValueChange={(value: PlanPeriod) => setPlanPeriod(value)} disabled={!selectedClient}>
                        <SelectTrigger id="plan-period"><SelectValue placeholder="Selecione o período" /></SelectTrigger>
                        <SelectContent>{periodOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="due-date">{t('dueDate')}</Label>
                   <Select value={dueDate ? String(dueDate) : ''} onValueChange={(value) => setDueDate(parseInt(value, 10))} disabled={!planPeriod}>
                      <SelectTrigger id="due-date"><SelectValue placeholder={"Escolha o dia de vencimento"} /></SelectTrigger>
                      <SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                {nextDueDate && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <p className="font-semibold text-base">Próximo Vencimento: <span className="font-bold">{format(nextDueDate, 'dd/MM/yyyy')}</span></p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                   <Label htmlFor="plan-value">{t('planValue')}</Label>
                   <Input id='plan-value' value={planValue} onChange={handleCurrencyChange} disabled={isCourtesy || !selectedClient} placeholder={formatCurrency(0)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="courtesy" checked={isCourtesy} onCheckedChange={(checked) => setIsCourtesy(checked as boolean)} disabled={!selectedClient} />
                  <label htmlFor="courtesy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('courtesy')}</label>
                </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
                  <Button onClick={handleAddOrUpdatePlan} disabled={!isFormValid}>
                    {editingPlanIndex !== null ? 'Atualizar Plano' : t('addPlan')}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {planToShowDetails && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('details')} do Plano: {planToShowDetails.plan.name}</DialogTitle>
                    <DialogDescription>
                        Revise as informações do plano contratado pelo cliente.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-primary">{t('panelDetails')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label={t('panel')} value={planToShowDetails.panel.name} />
                      <DetailItem label={t('servers')} value={planToShowDetails.server.name} />
                    </div>
                    <Separator />
                    <h3 className="text-lg font-semibold text-primary">{t('subscriptionPlans')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label={t('plans')} value={planToShowDetails.plan.name} />
                      <DetailItem label={t('screens')} value={planToShowDetails.screens} />
                       <ValueDisplay
                          value={planToShowDetails.planValue}
                          isCourtesy={planToShowDetails.isCourtesy}
                        />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('status')}</p>
                           <Badge variant={getStatusVariant(planToShowDetails.status)} className="text-base mt-1">
                                {t((planToShowDetails.status || 'pending').toLowerCase() as any)}
                           </Badge>
                       </div>
                    </div>
                    <Separator />
                    <h3 className="text-lg font-semibold text-primary">Detalhes de Pagamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Período do Plano" value={periodOptions.find(p => p.value === planToShowDetails.planPeriod)?.label} />
                        <DetailItem label={t('dueDate')} value={planToShowDetails.dueDate} />
                    </div>
                    <Separator />
                    <h3 className="text-lg font-semibold text-primary">Pendências</h3>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      {getPendingScreensCount(planToShowDetails) > 0 ? (
                        <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                           <AlertTriangle className="h-5 w-5" />
                           <p className="font-semibold">Existem {getPendingScreensCount(planToShowDetails)} telas com configuração pendente.</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhuma pendência encontrada para este plano.</p>
                      )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsDetailsModalOpen(false)}>{t('ok')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

// For exporting the type to parent
export type { SelectedPlan };
