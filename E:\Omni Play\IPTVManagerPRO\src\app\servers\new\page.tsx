
'use client';

import * as React from 'react';
import { ServerForm } from '../components/server-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/app-layout';

export default function NewServerPage() {
  const { t } = useLanguage();
  const [isFormVisible, setIsFormVisible] = React.useState(false);

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('panelAndServerRegistration')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isFormVisible ? (
              <ServerForm server={null} />
            ) : (
              <div className="flex justify-start">
                <Button size="lg" onClick={() => setIsFormVisible(true)}>
                  {t('addPanel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
