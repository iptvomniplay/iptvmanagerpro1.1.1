'use client';

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSearch } from './components/client-search';

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
        <CardContent>
          <ClientSearch />
          {/* O formulário de assinatura será construído aqui após a seleção do cliente */}
        </CardContent>
      </Card>
    </div>
  );
}
