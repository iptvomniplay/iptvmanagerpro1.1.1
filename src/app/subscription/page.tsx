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
import { User, FileText, AppWindow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlanForm, type SelectedPlan } from './components/subscription-plan-form';
import { ApplicationsForm } from './components/applications-form';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { updateClient } = useData();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );
  const [manualId, setManualId] = React.useState('');
  const [addedPlans, setAddedPlans] = React.useState<SelectedPlan[]>([]);

  React.useEffect(() => {
    if (selectedClient) {
        if (selectedClient.status === 'Active') {
            setManualId(selectedClient.id);
        } else {
            setManualId('');
        }
        setAddedPlans(selectedClient.plans || []);
    } else {
        setManualId('');
        setAddedPlans([]);
    }
  }, [selectedClient]);

  const totalScreens = React.useMemo(() => {
    return addedPlans.reduce((total, plan) => total + plan.screens, 0);
  }, [addedPlans]);

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

  const handleCancel = () => {
    setSelectedClient(null);
    setManualId('');
  };

  const handleSave = () => {
    if (!selectedClient) return;

    let clientToUpdate = { ...selectedClient, plans: addedPlans };
    let idChanged = false;

    if (
      manualId &&
      selectedClient.status !== 'Active' &&
      manualId !== selectedClient.id
    ) {
      clientToUpdate = {
        ...clientToUpdate,
        id: manualId,
        status: 'Active',
      };
      idChanged = true;
    }

    updateClient(clientToUpdate);

    toast({
      title: t('registrationAddedSuccess'),
      description: idChanged
        ? `O cliente ${clientToUpdate.name} foi ativado com o ID: ${clientToUpdate.id}`
        : `Os dados do cliente ${clientToUpdate.name} foram salvos.`,
    });

    handleCancel();
  };

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
                onSelectClient={setSelectedClient}
                selectedClient={selectedClient}
              />
            </div>
          </CardContent>
        </Card>

        {selectedClient ? (
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto rounded-lg p-1 bg-transparent border-b-0">
                <TabsTrigger value="client" className="py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                    <User className="mr-2 h-5 w-5" />
                    {t('client')}
                </TabsTrigger>
                <TabsTrigger value="plans" className="py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
                    <FileText className="mr-2 h-5 w-5" />
                    {t('subscriptionPlans')}
                </TabsTrigger>
                <TabsTrigger value="apps" className="py-3 text-base rounded-md font-semibold bg-card shadow-sm border border-primary text-card-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:border-primary">
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
                        {t('status')}
                      </p>
                      <Badge
                        variant={getStatusVariant(selectedClient.status)}
                        className="text-base mt-1"
                      >
                        {t(selectedClient.status.toLowerCase() as any)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="manual-client-id">{t('clientID')}</Label>
                      <Input
                        id="manual-client-id"
                        placeholder={t('clientIdManualPlaceholder')}
                        autoComplete="off"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        disabled={selectedClient.status === 'Active'}
                      />
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
                    screensToRender={totalScreens}
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
    </div>
  );
}
