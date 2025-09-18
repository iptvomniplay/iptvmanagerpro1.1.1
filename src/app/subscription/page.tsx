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
import { ClientSearch } from './components/client-search';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlanForm } from './components/subscription-plan-form';

export default function SubscriptionPage() {
  const { t } = useLanguage();
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptionManagement')}</CardTitle>
          <CardDescription>
            {t('subscriptionManagementDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full md:w-1/2 space-y-4">
          <ClientSearch
            onSelectClient={setSelectedClient}
            selectedClient={selectedClient}
          />
          {selectedClient && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <User className="h-6 w-6" />
                  <span>{selectedClient.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      {t('nickname')}
                    </p>
                    <p className="mt-1">{selectedClient.nickname || '---'}</p>
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
                  <div>
                    <p className="font-medium text-muted-foreground">
                      {t('clientID')}
                    </p>
                    <p
                      className={cn(
                        'mt-1 font-semibold',
                        isIdPending && 'text-yellow-500 animate-flash'
                      )}
                    >
                      {displayedId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full space-y-2">
            <Label htmlFor="manual-client-id">{t('clientID')}</Label>
            <Input
              id="manual-client-id"
              placeholder={t('clientIdManualPlaceholder')}
              autoComplete="off"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              disabled={!selectedClient}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptionPlans')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionPlanForm />
        </CardContent>
      </Card>
    </div>
  );
}
