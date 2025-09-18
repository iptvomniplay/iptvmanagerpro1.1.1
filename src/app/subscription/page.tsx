'use client';

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSearch } from './components/client-search';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SubscriptionPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptionManagement')}</CardTitle>
          <CardDescription>
            {t('subscriptionManagementDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ClientSearch />
        </CardContent>
      </Card>

      <div className="w-full md:w-1/2 space-y-2">
        <Label htmlFor="manual-client-id">ID do Cliente (Manual)</Label>
        <Input
          id="manual-client-id"
          placeholder="Insira o ID do cliente gerado no painel"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
