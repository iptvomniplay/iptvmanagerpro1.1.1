'use client';

import { ConfigurationForm } from './components/configuration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function ConfigureServerPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('serverParameterValidator')}
        </h1>
        <p className="text-muted-foreground">
          {t('serverParameterValidatorDescription')}
        </p>
      </div>

       <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('howItWorks')}</AlertTitle>
          <AlertDescription>
            {t('howItWorksDescription')}
          </AlertDescription>
        </Alert>

      <Card>
        <CardHeader>
            <CardTitle>{t('configurationValidator')}</CardTitle>
            <CardDescription>{t('configurationValidatorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <ConfigurationForm />
        </CardContent>
      </Card>
    </div>
  );
}
