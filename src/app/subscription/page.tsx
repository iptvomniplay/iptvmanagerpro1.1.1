'use client';

import * as React from 'react';
import type { Client } from '@/lib/types';
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
import { SubscriptionPlanForm } from './components/subscription-plan-form';
import { ApplicationsForm } from './components/applications-form';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { updateClient } = useData();
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );
  const [manualId, setManualId] = React.useState('');

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

  const displayedId =
    manualId || (selectedClient?.status === 'Active' ? selectedClient.id : 'N/A');
  const isIdPending = manualId !== '' && manualId !== selectedClient?.id;

  const handleUpdateClient = (updatedClient: Client) => {
    setSelectedClient(updatedClient);
    updateClient(updatedClient);
  };
  
  const handleCancel = () => {
    setSelectedClient(null);
    setManualId('');
    // We might need to reset states inside child components as well
    // For now, this just resets the main page state.
  };

  const handleSave = () => {
    // Implement save logic here
    console.log("Saving changes for client:", selectedClient);
    if(selectedClient && isIdPending) {
        // This is where you would persist the manualId
    }
  }


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
            <TabsList>
              <TabsTrigger value="client">
                <User className="mr-2" />
                {t('client')}
              </TabsTrigger>
              <TabsTrigger value="plans">
                  <FileText className="mr-2" />
                  {t('subscriptionPlans')}
              </TabsTrigger>
              <TabsTrigger value="apps">
                  <AppWindow className="mr-2" />
                  {t('applications')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="client">
              <Card className="mt-4">
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
                      <p className="mt-1">{selectedClient.nickname || '---'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('emailAddress')}
                      </p>
                      <p className="mt-1 truncate" title={selectedClient.email}>{selectedClient.email || '---'}</p>
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
                        disabled={!selectedClient}
                        className={cn(isIdPending && 'ring-2 ring-yellow-500/80 animate-flash')}
                      />
                       <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">ID Atual: </span>
                        <span className={cn(isIdPending && 'text-yellow-500 font-bold')}>{displayedId}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans">
              <Card className="mt-4">
                  <CardHeader>
                  <CardTitle>{t('subscriptionPlans')}</CardTitle>
                   <CardDescription>{t('addSubscriptionPlanDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <SubscriptionPlanForm />
                  </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="apps">
              <Card className="mt-4">
                  <CardHeader>
                  <CardTitle>{t('applications')}</CardTitle>
                  <CardDescription>{t('addApplicationDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <ApplicationsForm 
                      selectedClient={selectedClient} 
                      onUpdateClient={handleUpdateClient} 
                  />
                  </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        ) : (
           <Card className="flex flex-col items-center justify-center text-center py-20">
              <CardHeader>
                  <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <CardTitle className="mt-4 text-xl font-semibold">{t('selectClientPrompt')}</CardTitle>
                  <CardDescription className="mt-2 max-w-sm">{t('selectClientPromptDescription')}</CardDescription>
              </CardHeader>
          </Card>
        )}
      </div>
       <div className="mt-auto flex items-center justify-end gap-4 pt-8">
        <Button variant="outline" onClick={() => router.push('/')}>
          {t('back')}
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          {t('cancel')}
        </Button>
        {selectedClient && (
          <Button onClick={handleSave}>
            {t('save')}
          </Button>
        )}
      </div>
    </div>
  );
}
