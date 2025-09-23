'use client';

import * as React from 'react';
import type { Application, Client, Test } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClientSearch } from './components/client-search';
import { Badge } from '@/components/ui/badge';
import { User, Save, UserCheck, X, AlertTriangle, Info } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { add, isFuture, parseISO } from 'date-fns';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { clients, updateClient } = useData();
  const { toast } = useToast();

  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [manualId, setManualId] = React.useState('');
  const [isValidationError, setIsValidationError] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState('');
  const [isIdSaveSuccessModalOpen, setIsIdSaveSuccessModalOpen] = React.useState(false);
  const [isSubscriptionSuccessModalOpen, setIsSubscriptionSuccessModalOpen] = React.useState(false);
  
  const arePlansIncomplete = !selectedClient?.plans || selectedClient.plans.length === 0;
  
  const totalScreensFromPlans = React.useMemo(() => 
    selectedClient?.plans?.reduce((sum, plan) => sum + plan.screens, 0) || 0,
    [selectedClient?.plans]
  );
  const configuredAppsCount = selectedClient?.applications?.length || 0;
  const areAppsIncomplete = totalScreensFromPlans > configuredAppsCount;

  const isReadyForActivation = selectedClient && selectedClient.id && !arePlansIncomplete && !areAppsIncomplete;

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

    // Fetch the most up-to-date client from the global list to avoid state inconsistencies
    const currentGlobalClient = clients.find(c => c._tempId === selectedClient._tempId);
    if (!currentGlobalClient) return;

    const newClientState = { ...currentGlobalClient, ...updatedData };
    
    // Update the global state and localStorage
    updateClient(newClientState);
    
    // Update the local state to reflect the changes immediately
    setSelectedClient(newClientState);
  };


  const saveManualId = () => {
    if (!selectedClient) return;
    
    if (!manualId.trim()) {
        toast({
            variant: "destructive",
            title: t('validationError'),
            description: t('clientIdRequired'),
        });
        return;
    }

    if (selectedClient.id && selectedClient.id === manualId) {
      toast({
        title: t('clientIdAlreadySaved'),
      });
      return;
    }
    const newClientState = { ...selectedClient, id: manualId };
    updateClient(newClientState); 
    setSelectedClient(newClientState); 
    setIsIdSaveSuccessModalOpen(true);
  };

  const validateAndSave = () => {
    if (!selectedClient) return;

    if (!selectedClient.id && !manualId) {
      setValidationMessage(t('clientIdRequired'));
      setIsValidationError(true);
      return;
    }
    if (arePlansIncomplete) {
        setValidationMessage(t('addAtLeastOnePlan'));
        setIsValidationError(true);
        return;
    }
    if (areAppsIncomplete) {
        setValidationMessage(t('fillAllApplications'));
        setIsValidationError(true);
        return;
    }
    
    let updatedTests: Test[] | undefined = selectedClient.tests;

    if (selectedClient.status === 'Test') {
        updatedTests = selectedClient.tests?.map(test => {
            const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
            if (isFuture(expirationDate)) {
                return { ...test, durationValue: 0, durationUnit: 'hours' as 'hours' };
            }
            return test;
        });
    }

    const clientToUpdate: Client = {
      ...selectedClient!,
      status: 'Active',
      id: manualId || selectedClient!.id,
      tests: updatedTests,
      activationDate: new Date().toISOString(),
    };

    updateClient(clientToUpdate);
    setIsSubscriptionSuccessModalOpen(true);
  };

  const handleCancel = () => {
    handleSelectClient(null);
  };

  const getStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'inactive';
      case 'Expired': return 'destructive';
      case 'Test': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-8 flex-1">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t('subscriptionManagement')}</CardTitle>
              <CardDescription>{t('subscriptionManagementDescription')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             {!selectedClient && (
                 <div className="w-full md:w-1/2">
                    <ClientSearch onSelectClient={handleSelectClient} selectedClient={selectedClient} />
                </div>
             )}
          </CardContent>
        </Card>

        {selectedClient ? (
          <>
             {selectedClient.status !== 'Active' && (
              <Alert variant="default" className="border-primary text-primary">
                <Info className="h-4 w-4" />
                <AlertTitle>{t('pendingActivationTitle')}</AlertTitle>
                <AlertDescription>
                  {t('pendingActivationDescription')}
                </AlertDescription>
              </Alert>
            )}

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
                            className={cn('pr-12', isValidationError && !manualId && 'ring-2 ring-destructive ring-offset-2 ring-offset-background')}
                          />
                          <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-10 text-muted-foreground hover:bg-transparent" onClick={saveManualId}>
                            <Save className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                </CardContent>
            </Card>
            
            <SubscriptionPlanForm
              selectedClient={selectedClient}
              onPlanChange={(plans) => handleUpdateClient({ plans })}
              onSelectClient={handleSelectClient}
            />
            <ApplicationsForm
              selectedClient={selectedClient}
              onUpdateApplications={(applications) => handleUpdateClient({ applications })}
            />
          </>
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
        <Button variant="outline" onClick={() => router.push('/clients')}>{t('back')}</Button>
        {selectedClient && (
            <>
                <Button variant="outline" onClick={handleCancel}>{t('cancel')}</Button>
                <Button onClick={validateAndSave} disabled={!isReadyForActivation}>
                    {t('activateSubscription')}
                </Button>
            </>
        )}
      </div>

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
            <AlertDialogTitle>{t('clientIdSavedSuccess')}</AlertDialogTitle>
            <AlertDialogDescription>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('clientIdSavedMessage', {
                    id: `<strong>${manualId}</strong>`,
                    name: `<strong>${selectedClient?.name}</strong>`,
                  }),
                }}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsIdSaveSuccessModalOpen(false)}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSubscriptionSuccessModalOpen} onOpenChange={setIsSubscriptionSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('success')}</AlertDialogTitle>
            <AlertDialogDescription>{t('newSubscriptionSuccess')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => { setIsSubscriptionSuccessModalOpen(false); handleCancel(); }}>{t('ok')}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}