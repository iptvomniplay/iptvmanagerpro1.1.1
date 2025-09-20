'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import type { Server, SubServer, PlanType as PlanType, Client, SelectedPlan, PlanPeriod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, X, Calendar as CalendarIcon, FilePenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { add, format, lastDayOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubscriptionPlanFormProps {
    selectedClient: Client | null;
    onPlanChange: (plans: SelectedPlan[]) => void;
    onPlanAdded: () => void;
}

export function SubscriptionPlanForm({ selectedClient, onPlanChange, onPlanAdded }: SubscriptionPlanFormProps) {
  const { t, language } = useLanguage();
  const { servers: panels } = useData();

  const [selectedPanelId, setSelectedPanelId] = React.useState<string>('');
  const [selectedServerName, setSelectedServerName] = React.useState<string>('');
  const [selectedPlanName, setSelectedPlanName] = React.useState<string>('');
  const [numberOfScreens, setNumberOfScreens] = React.useState<number | ''>('');
  const [planPeriod, setPlanPeriod] = React.useState<PlanPeriod | undefined>();
  const [dueDate, setDueDate] = React.useState<number | undefined>();
  const [planValue, setPlanValue] = React.useState('');
  const [isCourtesy, setIsCourtesy] = React.useState(false);
  const [nextDueDate, setNextDueDate] = React.useState<Date | null>(null);
  const [editingPlanIndex, setEditingPlanIndex] = React.useState<number | null>(null);

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
  }

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
      case '30d':
        calculatedDate = add(now, { days: 30 });
        break;
      case '3m':
        calculatedDate = add(now, { months: 3 });
        break;
      case '6m':
        calculatedDate = add(now, { months: 6 });
        break;
      case '1y':
        calculatedDate = add(now, { years: 1 });
        break;
      default:
        setNextDueDate(null);
        return;
    }
    
    // Adjust day
    const targetMonth = calculatedDate.getMonth();
    const targetYear = calculatedDate.getFullYear();
    const lastDay = lastDayOfMonth(new Date(targetYear, targetMonth)).getDate();
    const finalDay = Math.min(dueDate, lastDay);
    
    calculatedDate.setDate(finalDay);

    setNextDueDate(calculatedDate);

  }, [planPeriod, dueDate]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (!value) {
      setPlanValue('');
      return;
    }
    const numericValue = parseInt(value, 10) / 100;
    setPlanValue(formatCurrency(numericValue));
  };


  const handleAddOrUpdatePlan = () => {
    if (selectedPanel && selectedServer && selectedPlan && numberOfScreens && selectedClient && planPeriod) {
      const numericValue = parseFloat(planValue.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0;
      const newPlan: SelectedPlan = {
          panel: selectedPanel,
          server: selectedServer,
          plan: selectedPlan,
          screens: numberOfScreens,
          planValue: isCourtesy ? 0 : numericValue,
          isCourtesy: isCourtesy,
          planPeriod: planPeriod,
          dueDate: dueDate,
      };
      
      let newPlans: SelectedPlan[];
      if (editingPlanIndex !== null) {
        newPlans = [...(selectedClient.plans || [])];
        newPlans[editingPlanIndex] = newPlan;
      } else {
        newPlans = [...(selectedClient.plans || []), newPlan];
      }

      onPlanChange(newPlans);
      if (editingPlanIndex === null) {
        onPlanAdded();
      }

      resetForm();
    }
  };

  const handleRemovePlan = (indexToRemove: number) => {
    if (selectedClient && selectedClient.plans) {
      const newPlans = selectedClient.plans.filter((_, index) => index !== indexToRemove);
      onPlanChange(newPlans);
    }
  };

  const handleEditPlan = (indexToEdit: number) => {
    if (selectedClient && selectedClient.plans) {
        const planToEdit = selectedClient.plans[indexToEdit];
        setEditingPlanIndex(indexToEdit);
        
        setSelectedPanelId(planToEdit.panel.id);
        
        // Use timeouts to ensure state updates propagate
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
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }

  const periodOptions: { value: PlanPeriod; label: string }[] = [
    { value: '30d', label: '30 dias' },
    { value: '3m', label: '3 meses' },
    { value: '6m', label: '6 meses' },
    { value: '1y', label: '1 ano' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('panel')}</Label>
          <Select value={selectedPanelId} onValueChange={setSelectedPanelId} disabled={!selectedClient}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectPanel')} />
            </SelectTrigger>
            <SelectContent>
              {panels.map((panel) => (
                <SelectItem key={panel.id} value={panel.id}>
                  {panel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('servers')}</Label>
          <Select value={selectedServerName} onValueChange={setSelectedServerName} disabled={!selectedPanelId}>
            <SelectTrigger>
              <SelectValue placeholder={t('select')} />
            </SelectTrigger>
            <SelectContent>
              {availableServers.map((server) => (
                <SelectItem key={server.name} value={server.name}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <Label>{t('screensAvailable')}</Label>
                </div>
                <div className="h-11 w-full rounded-md border border-input bg-muted px-4 py-2 text-base font-bold text-center flex items-center justify-center">
                    {selectedServer ? selectedServer.screens : '-'}
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor='screens-to-hire'>{t('screensToHire')}</Label>
                <Select
                    onValueChange={(value) => setNumberOfScreens(parseInt(value, 10))}
                    disabled={!selectedServer}
                    value={numberOfScreens ? String(numberOfScreens) : ''}
                >
                    <SelectTrigger id="screens-to-hire">
                        <SelectValue placeholder={t('screensToHirePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {selectedServer && Array.from({ length: selectedServer.screens }, (_, i) => i + 1).map(
                            (num) => (
                                <SelectItem key={num} value={String(num)}>
                                    {num}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
          <Label>{t('plans')}</Label>
          <Select value={selectedPlanName} onValueChange={setSelectedPlanName} disabled={!selectedServerName}>
            <SelectTrigger>
              <SelectValue placeholder={t('select')} />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map((plan) => (
                <SelectItem key={plan.name} value={plan.name}>
                  {plan.name} {plan.value ? `(${formatCurrency(plan.value)})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="plan-period">Período do Plano</Label>
            <Select
                value={planPeriod}
                onValueChange={(value: PlanPeriod) => setPlanPeriod(value)}
                disabled={!selectedClient}
            >
                <SelectTrigger id="plan-period">
                    <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                    {periodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
           <Label htmlFor="due-date">{t('dueDate')}</Label>
           <Select
              value={dueDate ? String(dueDate) : ''}
              onValueChange={(value) => setDueDate(parseInt(value, 10))}
              disabled={!planPeriod}
            >
              <SelectTrigger id="due-date">
                <SelectValue placeholder={"Escolha o dia de vencimento"} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(
                  (day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
        </div>
        
        {nextDueDate && (
          <div className="p-3 bg-muted/50 rounded-lg border border-dashed animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <p className="font-semibold text-base">
                Próximo Vencimento: <span className="font-bold">{format(nextDueDate, 'dd/MM/yyyy')}</span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
           <Label htmlFor="plan-value">{t('planValue')}</Label>
           <Input
              id='plan-value'
              value={planValue}
              onChange={handleCurrencyChange}
              disabled={isCourtesy || !selectedClient}
              placeholder={formatCurrency(0)}
            />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="courtesy" checked={isCourtesy} onCheckedChange={(checked) => setIsCourtesy(checked as boolean)} disabled={!selectedClient} />
          <label
            htmlFor="courtesy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('courtesy')}
          </label>
        </div>

      </div>
      
       <div className="flex justify-end gap-4">
            {editingPlanIndex !== null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                    {t('cancel')}
                </Button>
            )}
            <Button 
                onClick={handleAddOrUpdatePlan} 
                disabled={!isFormValid}
                className={cn(isFormValid && editingPlanIndex === null && "animate-[flash-success_1.5s_ease-in-out]")}
            >
                {editingPlanIndex !== null ? 'Atualizar Plano' : t('addPlan')}
            </Button>
        </div>

      {selectedClient?.plans && selectedClient.plans.length > 0 && (
        <Collapsible defaultOpen className="space-y-2">
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted cursor-pointer">
                    <span className="font-semibold">{t('addedPlans')}</span>
                    <div className="flex items-center">
                        <Badge variant="secondary">{selectedClient.plans.length}</Badge>
                        <ChevronDown className="h-5 w-5 ml-2" />
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
                {selectedClient.plans.map((item, index) => (
                  <Card key={index} className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base">{item.plan.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditPlan(index)}>
                            <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemovePlan(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <span className="font-semibold">{t('panel')}:</span> {item.panel.name}
                      </p>
                      <p>
                        <span className="font-semibold">{t('servers')}:</span> {item.server.name}
                      </p>
                       <div className="flex justify-between items-center">
                          <div>
                              <span className="font-semibold">{t('screens')}: </span>
                              <Badge variant="secondary">{item.screens}</Badge>
                          </div>
                          <div>
                              <span className="font-semibold">{t('value')}: </span>
                              <Badge variant={item.isCourtesy ? 'default' : 'outline'} className="text-base">
                                  {item.isCourtesy ? t('courtesy') : formatCurrency(item.planValue)}
                              </Badge>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
            </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// For exporting the type to parent
export type { SelectedPlan };
