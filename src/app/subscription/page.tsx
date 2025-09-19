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
import { User, FileText, AppWindow, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlanForm, type SelectedPlan } from './components/subscription-plan-form';
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

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { clients, updateClient } = useData();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );
  const [manualId, setManualId] = React.useState('');
  const [addedPlans, setAddedPlans] = React.useState<SelectedPlan[]>([]);
  const [activeTab, setActiveTab] = React.useState('client');
  const [isValidationError, setIsValidationError] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState('');
  const [isPlanAdded, setIsPlanAdded] = React.useState(false);

  const plansTabRef = React.useRef<HTMLButtonElement>(null);
  const appsTabRef = React.useRef<HTMLButtonElement>(null);

  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setAddedPlans(client.plans || []);
      setManualId(client.id || '');
    } else {
      setAddedPlans([]);
      setManualId('');
    }
  };

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

  const handleUpdateClient = (updatedClient: Client) => {
    setSelectedClient(updatedClient);
  };
  
  const handleManualIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setManualId(newId);
    if (selectedClient) {
      // Create a new object to ensure state update triggers re-render
      const updatedClient = { ...selectedClient, id: newId };
      // Update the client in the global state immediately
      updateClient(updatedClient);
      // Also update the local state to be in sync
      setSelectedClient(updatedClient);
    }
  }


  const handleCancel = () => {
    setSelectedClient(null);
    setManualId('');
    setAddedPlans([]);
    setActiveTab('client');
  };

  const validateForms = () => {
    if (addedPlans.length === 0) {
      setValidationMessage(t('addAtLeastOnePlan'));
      setActiveTab('plans');
      plansTabRef.current?.focus();
      return false;
    }

    const totalScreensFromPlans = addedPlans.reduce((sum, plan) => sum + plan.screens, 0);
    const totalApplications = selectedClient?.applications?.length || 0;

    if (totalApplications < totalScreensFromPlans) {
        setValidationMessage(t('fillAllApplications'));
        setActiveTab('apps');
        appsTabRef.current?.focus();
        return false;
    }
    
    if (!manualId && selectedClient?.status !== 'Active') {
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
        plans: addedPlans, 
        status: 'Active', // Set status to Active
        id: manualId || selectedClient.id,
    };

    updateClient(clientToUpdate);

    toast({
      title: t('registrationAddedSuccess'),
      description: `O status do cliente ${clientToUpdate.name} foi atualizado para Ativo.`,
    });

    handleCancel();
  };
  
  const totalScreensFromPlans = addedPlans.reduce((sum, plan) => sum + plan.screens, 0);
  const totalApplications = selectedClient?.applications?.length || 0;
  const arePlansIncomplete = addedPlans.length === 0;
  const areAppsIncomplete = totalApplications < totalScreensFromPlans;


  return (
    <div className="flex flex-col h-full">
      <div className="space-y-8 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('subscriptionManagement')}</CardTitle>
            <CardDescription>
              {t('subscriptionManagementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full md:w-1/2">
              <ClientSearch
                onSelectClient={handleSelectClient}
                selectedClient={selectedClient}
              />
            </div>
          </CardContent>
        </Card>

        {selectedClient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto rounded-lg p-1 bg-transparent border-b-0">
                <TabsTrigger value="client" className="py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                    <User className="mr-2 h-5 w-5" />
                    {t('client')}
                </TabsTrigger>
                <TabsTrigger ref={plansTabRef} value="plans" className="relative py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                    {arePlansIncomplete && isValidationError && <AlertTriangle className="absolute -top-2 -right-2 h-5 w-5 text-destructive animate-pulse" />}
                    <FileText className="mr-2 h-5 w-5" />
                    {t('subscriptionPlans')}
                </TabsTrigger>
                <TabsTrigger 
                    ref={appsTabRef} 
                    value="apps" 
                    disabled={!isPlanAdded && addedPlans.length === 0} 
                    className={cn(
                        "relative py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
                        isPlanAdded && "animate-[flash-success_1.5s_ease-in-out]"
                    )}
                >
                     {areAppsIncomplete && addedPlans.length > 0 && isValidationError && <AlertTriangle className="absolute -top-2 -right-2 h-5 w-5 text-destructive animate-pulse" />}
                    <AppWindow className="mr-2 h-5 w-5" />
                    {t('applications')}
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
                      <p className="font-medium text-muted-foreground">
                        {t('nickname')}
                      </p>
                      <p className="mt-1">
                        {selectedClient.nickname || '---'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('emailAddress')}
                      </p>
                      <p
                        className="mt-1 truncate"
                        title={selectedClient.email}
                      >
                        {selectedClient.email || '---'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('clientStatus')}
                      </p>
                      <Badge
                        variant={getStatusVariant(selectedClient.status)}
                        className="text-base mt-1"
                      >
                        {t(selectedClient.status.toLowerCase() as any)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="manual-client-id">{t('clientID')}:</Label>
                            {manualId && selectedClient.status === 'Active' && (
                                <Badge variant="outline" className="border-green-500/50 text-green-500">
                                    {manualId}
                                </Badge>
                            )}
                        </div>
                      <Input
                        id="manual-client-id"
                        placeholder={t('clientIdManualPlaceholder')}
                        autoComplete="off"
                        value={manualId}
                        onChange={handleManualIdChange}
                        disabled={selectedClient.status === 'Active'}
                        className={cn(!manualId && selectedClient.status !== 'Active' && isValidationError && 'ring-2 ring-destructive ring-offset-2 ring-offset-background')}
                      />
                       {!manualId && selectedClient.status !== 'Active' && isValidationError && <p className="text-sm text-destructive">{t('clientIdRequired')}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('subscriptionPlans')}</CardTitle>
                  <CardDescription>
                    {t('addSubscriptionPlanDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionPlanForm 
                    addedPlans={addedPlans}
                    setAddedPlans={setAddedPlans}
                    selectedClient={selectedClient}
                    onPlanAdded={() => {
                        setIsPlanAdded(true);
                        setTimeout(() => setIsPlanAdded(false), 2000);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apps" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('applications')}</CardTitle>
                  <CardDescription>
                    {t('addApplicationDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsForm
                    selectedClient={selectedClient}
                    onUpdateClient={handleUpdateClient}
                    addedPlans={addedPlans}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center py-20 mt-6">
            <CardHeader>
              <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <CardTitle className="mt-4 text-xl font-semibold">
                {t('selectClientPrompt')}
              </CardTitle>
              <CardDescription className="mt-2 max-w-sm">
                {t('selectClientPromptDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      <div className="mt-auto flex justify-end items-center gap-4 pt-8">
        <Button variant="outline" onClick={() => router.push('/')}>
          {t('back')}
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          {t('cancel')}
        </Button>
        {selectedClient && <Button onClick={handleSave}>{t('save')}</Button>}
      </div>

       <AlertDialog open={isValidationError} onOpenChange={setIsValidationError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              {t('validationError')}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-base">
              {validationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsValidationError(false)}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
