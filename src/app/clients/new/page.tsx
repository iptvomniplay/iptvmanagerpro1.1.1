'use client';

import { ClientForm } from '../components/client-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewClientPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
       <Card>
          <CardHeader>
              <CardTitle>{t('clientRegistration')}</CardTitle>
              <CardDescription>{t('registerNewClientDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
             <ClientForm client={null} />
          </CardContent>
      </Card>
    </div>
  );
}
