'use client';

import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FinancialPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('financial')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('underDevelopment')}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('cashFlow')}</CardTitle>
          <CardDescription>{t('cashFlowDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          
        </CardContent>
      </Card>
    </div>
  );
}
