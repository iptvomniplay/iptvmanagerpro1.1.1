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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X, Calendar as CalendarIcon, FilePenLine, PlusCircle, Eye, AlertTriangle, EyeOff, ChevronsUpDown, BookText, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { add, format, lastDayOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubscriptionPlanFormProps {
    selectedClient: Client | null;
    onPlanChange: (plans: SelectedPlan[]) => void;
    onSelectClient: (client: Client | null) => void;
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

export function SubscriptionPlanForm({ selectedClient, onPlanChange, onSelectClient }: SubscriptionPlanFormProps) {
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
  const [observations, setObservations] = React.useState('');

  const [isDeletePlanAlertOpen, setIsDeletePlanAlertOpen] = React.useState(false);
  const [planIndexToDelete, setPlanIndexToDelete] = React.useState<number | null>(null);


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
    setObservations('');
  };
  
  const handleOpenForm = (index: number | null = null) => {
    resetForm();
    if (index !== null && selectedClient?.plans) {
        const planToEdit = selectedClient.plans[index];
        setEditingPlanIndex(index);
        
        setSelectedPanelId(planToEdit.panel.id);
        
        // Use timeout to ensure state updates sequentially
        setTimeout(() => {
            const currentPanel = panels.find(p => p.id === planToEdit.panel.id);
            if (currentPanel && currentPanel.subServers) {
                setSelectedServerName(planToEdit.server.name);
                setTimeout(() => {
                    const currentServer = currentPanel.subServers.find(s => s.name === planToEdit.server.name);
                    if (currentServer) {
                      setSelectedPlanName(planToEdit.plan.name);
                    }
                }, 0);
            }
        }, 0);
        
        setNumberOfScreens(planToEdit.screens);
        setPlanPeriod(planToEdit.planPeriod);
        setDueDate(planToEdit.dueDate);
        setPlanValue(formatCurrency(planToEdit.planValue));
        setIsCourtesy(planToEdit.isCourtesy);
        setObservations(planToEdit.observations || '');
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

      let newPlan: SelectedPlan;

      if (editingPlanIndex !== null) {
          const originalPlan = selectedClient.plans[editingPlanIndex];
          newPlan = {
              ...originalPlan,
              panel: selectedPanel,
              server: selectedServer,
              plan: selectedPlan,
              screens: numberOfScreens,
              planValue: isCourtesy ? 0 : numericValue,
              isCourtesy: isCourtesy,
              planPeriod: planPeriod,
              dueDate: dueDate,
              observations: observations,
          };
      } else {
          newPlan = {
              panel: selectedPanel,
              server: selectedServer,
              plan: selectedPlan,
              screens: numberOfScreens,
              planValue: isCourtesy ? 0 : numericValue,
              isCourtesy: isCourtesy,
              planPeriod: planPeriod,
              dueDate: dueDate,
              observations: observations,
          };
      }
      
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

  const handleDeleteRequest = (index: number) => {
    setPlanIndexToDelete(index);
    setIsDeletePlanAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedClient && selectedClient.plans && planIndexToDelete !== null) {
      const newPlans = selectedClient.plans.filter((_, index) => index !== planIndexToDelete);
      onPlanChange(newPlans);
    }
    setPlanIndexToDelete(null);
    setIsDeletePlanAlertOpen(false);
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }

  const periodOptions: { value: PlanPeriod; label: string }[] = [
    { value: '30d', label: t('30days') }, { value: '3m', label: t('3months') },
    { value: '6m', label: t('6months') }, { value: '1y', label: t('1year') },
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
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
            <div>
                <CardTitle>{t('subscriptionPlans')}</CardTitle>
                <CardDescription>{t('clientSubscriptionPlans')}</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm(null)} disabled={!selectedClient}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addPlan')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-dashed animate-in fade-in-50 w-fit">
                    <div className="flex items-center gap-3">
                        <UserCheck className="h-6 w-6 text-primary"/>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">{t('client')}</span>
                          <p className="font-bold text-lg">{selectedClient.name}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onSelectClient(null)}>
                        <X className="h-5 w-5"/>
                    </Button>
                </div>
              )}
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
                                <Button variant="destructive" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); handleDeleteRequest(index);}}>
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
                    <p>{!selectedClient ? t('selectClientPrompt') : t('noPlansAdded')}</p>
                </div>
            )}
          </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>{editingPlanIndex !== null ? t('editPlan') : t('addPlan')}</DialogTitle>
                  <DialogDescription>
                      {editingPlanIndex !== null ? t('editPlanDescription') : t('addPlanDescription')}
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 py-4 px-6">
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
                      <Label htmlFor="plan-period">{t('planPeriod')}</Label>
                      <Select value={planPeriod} onValueChange={(value: PlanPeriod) => setPlanPeriod(value)} disabled={!selectedClient}>
                          <SelectTrigger id="plan-period"><SelectValue placeholder={t('selectPeriod')} /></SelectTrigger>
                          <SelectContent>{periodOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="due-date">{t('dueDate')}</Label>
                     <Select value={dueDate ? String(dueDate) : ''} onValueChange={(value) => setDueDate(parseInt(value, 10))} disabled={!planPeriod}>
                        <SelectTrigger id="due-date"><SelectValue placeholder={t('selectDueDate')} /></SelectTrigger>
                        <SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}</SelectContent>
                      </Select>
                  </div>
                  {nextDueDate && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed animate-in fade-in-50 slide-in-from-bottom-2">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <p className="font-semibold text-base">{t('nextDueDate')}: <span className="font-bold">{format(nextDueDate, 'dd/MM/yyyy')}</span></p>
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
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                        {t('observations')}
                        <ChevronsUpDown className="h-5 w-5" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Textarea
                        placeholder={t('observationsPlaceholder')}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        autoComplete="off"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>
              <DialogFooter className="px-6 pb-6 pt-2">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
                  <Button onClick={handleAddOrUpdatePlan} disabled={!isFormValid}>
                    {editingPlanIndex !== null ? t('updatePlan') : t('addPlan')}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {planToShowDetails && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('planDetailsTitle')}: {planToShowDetails.plan.name}</DialogTitle>
                    <DialogDescription>
                        {t('planDetailsDescription')}
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
                    <h3 className="text-lg font-semibold text-primary">{t('paymentDetails')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label={t('planPeriod')} value={periodOptions.find(p => p.value === planToShowDetails.planPeriod)?.label} />
                        <DetailItem label={t('dueDate')} value={planToShowDetails.dueDate} />
                    </div>
                    {planToShowDetails.observations && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
                            <BookText className="h-5 w-5" />
                            {t('observations')}
                          </h3>
                          <p className="text-base text-muted-foreground whitespace-pre-wrap">{planToShowDetails.observations}</p>
                        </div>
                      </>
                    )}
                    <Separator />
                    <h3 className="text-lg font-semibold text-primary">{t('pendencies')}</h3>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      {getPendingScreensCount(planToShowDetails) > 0 ? (
                        <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                           <AlertTriangle className="h-5 w-5" />
                           <p className="font-semibold">{t('pendingScreensWarning', { count: getPendingScreensCount(planToShowDetails) })}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('noPendenciesFound')}</p>
                      )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsDetailsModalOpen(false)}>{t('ok')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeletePlanAlertOpen} onOpenChange={setIsDeletePlanAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deletePlanWarning')} <span className="font-bold">{selectedClient?.plans && planIndexToDelete !== null ? selectedClient.plans[planIndexToDelete].plan.name : ''}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeletePlanAlertOpen(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

// For exporting the type to parent
export type { SelectedPlan };
