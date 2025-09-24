
'use client';

import { ServerForm } from '../../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import type { Server } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/hooks/use-data';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import AppLayout from '@/components/layout/app-layout';

export default function EditServerPage() {
  const { t } = useLanguage();
  const params = useParams();
  const { servers } = useData();
  
  const server = useMemo(() => servers.find((s) => s.id === params.id) || null, [servers, params.id]);

  return (
    <AppLayout>
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
    </AppLayout>
  );
}
