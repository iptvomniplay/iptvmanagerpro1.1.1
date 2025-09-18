'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import type { Server, SubServer, Plan as PlanType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SelectedPlan {
  panel: Server;
  server: SubServer;
  plan: PlanType;
  screens: number;
}

export function SubscriptionPlanForm() {
  const { t } = useLanguage();
  const { servers: panels } = useData();

  const [selectedPanelId, setSelectedPanelId] = React.useState<string>('');
  const [selectedServerName, setSelectedServerName] = React.useState<string>('');
  const [selectedPlanName, setSelectedPlanName] = React.useState<string>('');
  const [numberOfScreens, setNumberOfScreens] = React.useState<number>(1);
  const [addedPlans, setAddedPlans] = React.useState<SelectedPlan[]>([]);

  const selectedPanel = panels.find((p) => p.id === selectedPanelId);
  const availableServers = selectedPanel?.subServers || [];
  const selectedServer = availableServers.find((s) => s.name === selectedServerName);
  const availablePlans = selectedServer?.plans || [];
  const selectedPlan = availablePlans.find((p) => p.name === selectedPlanName);

  const handleAddPlan = () => {
    if (selectedPanel && selectedServer && selectedPlan) {
      setAddedPlans([
        ...addedPlans,
        {
          panel: selectedPanel,
          server: selectedServer,
          plan: selectedPlan,
          screens: numberOfScreens,
        },
      ]);
      // Reset form
      setSelectedPanelId('');
      setSelectedServerName('');
      setSelectedPlanName('');
      setNumberOfScreens(1);
    }
  };

  const handleRemovePlan = (indexToRemove: number) => {
    setAddedPlans(addedPlans.filter((_, index) => index !== indexToRemove));
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('panel')}</Label>
          <Select value={selectedPanelId} onValueChange={setSelectedPanelId}>
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
            <Input
                value={selectedServer ? selectedServer.screens : ''}
                readOnly
                className="bg-muted"
            />
        </div>

        <div className="space-y-2">
          <Label>{t('screensToHire')}</Label>
          <Input
            type="number"
            min="1"
            value={numberOfScreens}
            onChange={(e) => setNumberOfScreens(parseInt(e.target.value, 10) || 1)}
            disabled={!selectedPlanName}
            placeholder={t('screensToHirePlaceholder')}
          />
        </div>
      </div>
      
       <div className="flex justify-end">
            <Button onClick={handleAddPlan} disabled={!selectedPlan}>
                {t('addPlan')}
            </Button>
        </div>

      {addedPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('addedPlans')}</h3>
          {addedPlans.map((item, index) => (
            <Card key={index} className="bg-muted/50">
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
                        <Badge variant="outline" className="text-base">{formatCurrency(item.plan.value)}</Badge>
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
