'use client';

import { ConfigurationForm } from './components/configuration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function ConfigureServerPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('serverParameterValidator')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('serverParameterValidatorDescription')}
        </p>
      </div>

       <Alert className="p-6">
          <Terminal className="h-5 w-5" />
          <AlertTitle className="text-lg">{t('howItWorks')}</AlertTitle>
          <AlertDescription className="text-base">
            {t('howItWorksDescription')}
          </AlertDescription>
        </Alert>

      <Card>
        <CardHeader className="p-8">
            <CardTitle className="text-2xl">{t('configurationValidator')}</CardTitle>
            <CardDescription className="text-base">{t('configurationValidatorDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <ConfigurationForm />
        </CardContent>
      </Card>
    </div>
  );
}
