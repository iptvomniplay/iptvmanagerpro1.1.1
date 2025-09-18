'use client';

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
          <p>{t('awaitingInput')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
