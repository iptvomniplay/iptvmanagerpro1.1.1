'use client';

import { ServerForm } from '../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewServerPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('panelAndServerRegistration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerForm server={null} />
        </CardContent>
      </Card>
    </div>
  );
}
