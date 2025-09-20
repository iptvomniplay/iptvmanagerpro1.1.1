'use client';

import * as React from 'react';
import type { Application, Client, Plan, Server, SubServer } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ClientSearch } from './components/client-search';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, FileText, AppWindow, AlertTriangle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlanForm } from './components/subscription-plan-form';
import { ApplicationsForm } from './components/applications-form';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PersistenceTest } from './components/persistence-test';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { clients, updateClient } = useData();
  const { toast } = useToast();

  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [manualId, setManualId] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('client');
  const [isValidationError, setIsValidationError] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState('');
  const [isPlanAdded, setIsPlanAdded] = React.useState(false);
  const [isIdSaveSuccessModalOpen, setIsIdSaveSuccessModalOpen] = React.useState(false);
  const [isSubscriptionSuccessModalOpen, setIsSubscriptionSuccessModalOpen] = React.useState(false);

  const plansTabRef = React.useRef<HTMLButtonElement>(null);
  const appsTabRef = React.useRef<HTMLButtonElement>(null);

  const handleSelectClient = (client: Client | null) => {
    if (client) {
      const fullClientData = clients.find(c => c._tempId === client._tempId) || client;
      setSelectedClient(fullClientData);
      setManualId(fullClientData.id || '');
    } else {
      setSelectedClient(null);
      setManualId('');
    }
  };
  
  const handleManualIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualId(e.target.value);
  }

  const handleUpdateClient = (updatedData: Partial<Client>) => {
    if (!selectedClient) return;
    const newClientState = { ...selectedClient, ...updatedData };
    setSelectedClient(newClientState);
    updateClient(newClientState, true); // skipSave = true to avoid saving to LS on every change
  };

  const saveManualId = () => {
    if (!selectedClient) return;
    if (selectedClient.id && selectedClient.id === manualId) {
      toast({
        title: "ID do Cliente já foi salvo!",
      });
      return;
    }
    const newClientState = { ...selectedClient, id: manualId };
    updateClient(newClientState, false); // Persistência ativada
    setSelectedClient(newClientState); 
    setIsIdSaveSuccessModalOpen(true);
  };

  const validateForms = () => {
    if (!selectedClient) return false;

    if (!selectedClient.plans || selectedClient.plans.length === 0) {
      setValidationMessage(t('addAtLeastOnePlan'));
      setActiveTab('plans');
      plansTabRef.current?.focus();
      return false;
    }

    const totalScreensFromPlans = selectedClient.plans.reduce((sum, plan) => sum + plan.screens, 0);
    const totalApplications = selectedClient.applications?.length || 0;

    if (totalApplications < totalScreensFromPlans) {
      setValidationMessage(t('fillAllApplications'));
      setActiveTab('apps');
      appsTabRef.current?.focus();
      return false;
    }

    if (!manualId && selectedClient.status !== 'Active') {
      setValidationMessage(t('clientIdRequired'));
      setActiveTab('client');
      document.getElementById('manual-client-id')?.focus();
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!selectedClient) return;

    if (!validateForms()) {
      setIsValidationError(true);
      return;
    }

    const clientToUpdate: Client = {
      ...selectedClient,
      status: 'Active',
      id: manualId || selectedClient.id,
    };

    updateClient(clientToUpdate);
    setIsSubscriptionSuccessModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedClient(null);
    setManualId('');
    setActiveTab('client');
  };

  const totalScreensFromPlans = selectedClient?.plans?.reduce((sum, plan) => sum + plan.screens, 0) || 0;
  const totalApplications = selectedClient?.applications?.length || 0;
  const arePlansIncomplete = !selectedClient?.plans || selectedClient.plans.length === 0;
  const areAppsIncomplete = totalApplications < totalScreensFromPlans;

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
    <div className="flex flex-col h-full">
      <div className="space-y-8 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('subscriptionManagement')}</CardTitle>
            <CardDescription>{t('subscriptionManagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full md:w-1/2">
              <ClientSearch onSelectClient={handleSelectClient} selectedClient={selectedClient} />
            </div>
          </CardContent>
        </Card>

        {selectedClient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto rounded-lg p-1 bg-transparent border-b-0">
              <TabsTrigger value="client" className="py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                <User className="mr-2 h-5 w-5" /> {t('client')}
              </TabsTrigger>
              <TabsTrigger ref={plansTabRef} value="plans" className="relative py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                {arePlansIncomplete && isValidationError && <AlertTriangle className="absolute -top-2 -right-2 h-5 w-5 text-destructive animate-pulse" />}
                <FileText className="mr-2 h-5 w-5" /> {t('subscriptionPlans')}
              </TabsTrigger>
              <TabsTrigger ref={appsTabRef} value="apps" disabled={(!isPlanAdded && arePlansIncomplete)} className={cn("relative py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary disabled:opacity-50 disabled:cursor-not-allowed", isPlanAdded && "animate-[flash-success_1.5s_ease-in-out]")}>
                {areAppsIncomplete && totalScreensFromPlans > 0 && isValidationError && <AlertTriangle className="absolute -top-2 -right-2 h-5 w-5 text-destructive animate-pulse" />}
                <AppWindow className="mr-2 h-5 w-5" /> {t('applications')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <User className="h-6 w-6" />
                    <span>{selectedClient.name}</span>
                  </CardTitle>
                  <CardDescription>{t('clientDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">{t('nickname')}</p>
                      <p className="mt-1">{selectedClient.nickname || '---'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">{t('emailAddress')}</p>
                      <p className="mt-1 truncate" title={selectedClient.email}>{selectedClient.email || '---'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">{t('clientStatus')}</p>
                      <Badge variant={getStatusVariant(selectedClient.status)} className="text-base mt-1">{t(selectedClient.status.toLowerCase() as any)}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="manual-client-id">{t('clientID')}:</Label>
                        {selectedClient.id && <Badge variant="outline" className="border-green-500/50 text-green-500">{selectedClient.id}</Badge>}
                      </div>
                      <div className="relative">
                        <Input
                          id="manual-client-id"
                          placeholder={t('clientIdManualPlaceholder')}
                          autoComplete="off"
                          value={manualId}
                          onChange={handleManualIdChange}
                          className={cn('pr-12', !manualId && selectedClient.status !== 'Active' && isValidationError && 'ring-2 ring-destructive ring-offset-2 ring-offset-background')}
                        />
                        <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-10 text-muted-foreground hover:bg-transparent" onClick={saveManualId}>
                          <Save className="h-5 w-5" />
                        </Button>
                      </div>
                      {!manualId && selectedClient.status !== 'Active' && isValidationError && <p className="text-sm text-destructive">{t('clientIdRequired')}</p>}
                    </div>
                  </div>
                  <PersistenceTest selectedClient={selectedClient} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('subscriptionPlans')}</CardTitle>
                  <CardDescription>{t('addSubscriptionPlanDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionPlanForm
                    selectedClient={selectedClient}
                    onPlanChange={(plans) => handleUpdateClient({ plans })}
                    onPlanAdded={() => { setIsPlanAdded(true); setTimeout(() => setIsPlanAdded(false), 2000); }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apps" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('applications')}</CardTitle>
                  <CardDescription>{t('addApplicationDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsForm
                    selectedClient={selectedClient}
                    onUpdateApplications={(applications) => handleUpdateClient({ applications })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center py-20 mt-6">
            <CardHeader>
              <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <CardTitle className="mt-4 text-xl font-semibold">{t('selectClientPrompt')}</CardTitle>
              <CardDescription className="mt-2 max-w-sm">{t('selectClientPromptDescription')}</CardDescription>
            </CardHeader>
          </Card>
        )}

      </div>

      <div className="mt-auto flex justify-end items-center gap-4 pt-8">
        <Button variant="outline" onClick={() => router.push('/')}>{t('back')}</Button>
        <Button variant="outline" onClick={handleCancel}>{t('cancel')}</Button>
        {selectedClient && (
          <Button onClick={handleSave}>{t('save')}</Button>
        )}
      </div>

      {/* Alertas */}
      <AlertDialog open={isValidationError} onOpenChange={setIsValidationError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> {t('validationError')}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-base">{validationMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsValidationError(false)}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isIdSaveSuccessModalOpen} onOpenChange={setIsIdSaveSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ID do Cliente salvo com sucesso</AlertDialogTitle>
            <AlertDialogDescription>{`ID ${manualId} salvo para o cliente ${selectedClient?.name}.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsIdSaveSuccessModalOpen(false)}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSubscriptionSuccessModalOpen} onOpenChange={setIsSubscriptionSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('registrationAddedSuccess')}</AlertDialogTitle>
            <AlertDialogDescription>{t('newClientSuccess')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => { setIsSubscriptionSuccessModalOpen(false); handleCancel(); }}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
