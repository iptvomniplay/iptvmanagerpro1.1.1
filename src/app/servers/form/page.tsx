'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { ServerForm } from '../components/server-form';
import type { Server } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServerFormPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // In a real app, you would fetch the server data if it's an edit page
  const server = null; 

  const handleFormSubmit = (values: Omit<Server, 'id'>) => {
    // In a real app, you would handle the form submission (create/update)
    console.log('Form submitted', values);
    router.push('/servers');
  };

  const handleCancel = () => {
    router.push('/servers');
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {server ? t('editServer') : t('addPanel')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {server ? t('editServerDescription') : t('addServerPanelDescription')}
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">
                {server ? t('editServer') : t('addPanel')}
            </CardTitle>
            <CardDescription>
                {server ? t('editServerDescription') : t('addServerPanelDescription')}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ServerForm
              server={server}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
        </CardContent>
      </Card>
    </div>
  );
}
