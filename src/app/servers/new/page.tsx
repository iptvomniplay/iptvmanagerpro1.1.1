'use client';

import { ServerForm } from '../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewServerPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('panelAndServerRegistration')}</h1>
      </div>
      <Card>
          <CardHeader>
              <CardTitle>{t('serverName')}</CardTitle>
              <CardDescription>{t('serverNamePlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
              <ServerForm server={null} />
          </CardContent>
      </Card>
    </div>
  );
}
