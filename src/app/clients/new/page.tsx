
'use client';

import * as React from 'react';
import { ClientForm } from '../components/client-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';

export default function NewClientPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('clientRegistration')}</CardTitle>
            <CardDescription>{t('registerNewClientDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ClientForm client={null} onSubmitted={() => router.push('/clients')} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
