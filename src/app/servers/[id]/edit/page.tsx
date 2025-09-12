'use client';

import { ServerForm } from '../../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import { servers } from '@/lib/data';
import type { Server } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditServerPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const server = servers.find((s) => s.id === params.id) || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('editServer')}</h1>
      </div>
       <Card>
          <CardHeader>
              <CardTitle>{t('editServer')}</CardTitle>
              <CardDescription>{t('editServerDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
             <ServerForm server={server} />
          </CardContent>
      </Card>
    </div>
  );
}
