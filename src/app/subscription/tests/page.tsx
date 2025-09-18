'use client';

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewSubscriptionTestsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('viewTests')}</CardTitle>
          <CardDescription>
            Ainda em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t('awaitingInput')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
