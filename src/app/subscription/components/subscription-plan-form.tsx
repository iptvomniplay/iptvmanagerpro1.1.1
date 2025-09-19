'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import type { Server, SubServer, PlanType as PlanType, Client, SelectedPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface SubscriptionPlanFormProps {
    addedPlans: SelectedPlan[];
    setAddedPlans: React.Dispatch<React.SetStateAction<SelectedPlan[]>>;
    selectedClient: Client | null;
}

export function SubscriptionPlanForm({ addedPlans, setAddedPlans, selectedClient }: SubscriptionPlanFormProps) {
  const { t, language } = useLanguage();
  const { servers: panels } = useData();

  const [selectedPanelId, setSelectedPanelId] = React.useState<string>('');
  const [selectedServerName, setSelectedServerName] = React.useState<string>('');
  const [selectedPlanName, setSelectedPlanName] = React.useState<string>('');
  const [numberOfScreens, setNumberOfScreens] = React.useState<number | ''>('');
  const [dueDate, setDueDate] = React.useState<number | undefined>();
  const [planValue, setPlanValue] = React.useState('');
  const [isCourtesy, setIsCourtesy] = React.useState(false);


  const selectedPanel = panels.find((p) => p.id === selectedPanelId);
  const availableServers = selectedPanel?.subServers || [];
  const selectedServer = availableServers.find((s) => s.name === selectedServerName);
  const availablePlans = selectedServer?.plans || [];
  const selectedPlan = availablePlans.find((p) => p.name === selectedPlanName);
  
  React.useEffect(() => {
    if (selectedPlan && selectedPlan.value) {
      setPlanValue(formatCurrency(selectedPlan.value));
    } else {
      setPlanValue('');
    }
  }, [selectedPlan]);
  
  React.useEffect(() => {
    if (isCourtesy) {
      setPlanValue(formatCurrency(0));
    }
  }, [isCourtesy, language]);

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


  const handleAddPlan = () => {
    if (selectedPanel && selectedServer && selectedPlan && numberOfScreens && selectedClient) {
      const numericValue = parseFloat(planValue.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0;
      const newPlan: SelectedPlan = {
          panel: selectedPanel,
          server: selectedServer,
          plan: selectedPlan,
          screens: numberOfScreens,
          planValue: isCourtesy ? 0 : numericValue,
          isCourtesy: isCourtesy,
      };
      setAddedPlans([...addedPlans, newPlan]);

      // Reset form
      setSelectedPanelId('');
      setSelectedServerName('');
      setSelectedPlanName('');
      setNumberOfScreens('');
      setDueDate(undefined);
      setPlanValue('');
      setIsCourtesy(false);
    }
  };

  const handleRemovePlan = (indexToRemove: number) => {
    setAddedPlans(addedPlans.filter((_, index) => index !== indexToRemove));
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }

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
            <Label>{t('screensAvailable')}</Label>
            <div className="flex items-center justify-center h-11 w-full rounded-md border border-input bg-muted px-4 py-2 text-lg font-bold text-center">
              {selectedServer ? selectedServer.screens : '-'}
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor='screens-to-hire'>{t('screensToHire')}</Label>
          <Input
            id='screens-to-hire'
            type="number"
            min="1"
            value={numberOfScreens}
            onChange={(e) => setNumberOfScreens(e.target.value ? parseInt(e.target.value, 10) : '')}
            disabled={!selectedPlanName}
            placeholder=""
          />
        </div>
        
        <div className="space-y-2">
           <Label htmlFor="due-date">{t('dueDate')}</Label>
           <Select
              value={dueDate ? String(dueDate) : ''}
              onValueChange={(value) => setDueDate(parseInt(value, 10))}
              disabled={!selectedClient}
            >
              <SelectTrigger id="due-date">
                <SelectValue placeholder={t('selectDay')} />
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
      
       <div className="flex justify-end">
            <Button onClick={handleAddPlan} disabled={!selectedPlan || !selectedClient}>
                {t('addPlan')}
            </Button>
        </div>

      {addedPlans.length > 0 && (
        <Collapsible defaultOpen className="space-y-2">
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted cursor-pointer">
                    <span className="font-semibold">{t('addedPlans')}</span>
                    <div className="flex items-center">
                        <Badge variant="secondary">{addedPlans.length}</Badge>
                        <ChevronDown className="h-5 w-5 ml-2" />
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
                {addedPlans.map((item, index) => (
                  <Card key={index} className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base">{item.plan.name}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemovePlan(index)}>
                        <X className="h-4 w-4" />
                      </Button>
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
