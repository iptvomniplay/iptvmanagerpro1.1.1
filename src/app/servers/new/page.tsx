'use client';

import { ServerForm } from '../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent } from '@/components/ui/card';

export default function NewServerPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{t('panelAndServerRegistration')}</h1>
      </div>
      <Card>
          <CardContent>
              <ServerForm server={null} />
          </CardContent>
      </Card>
    </div>
  );
}
