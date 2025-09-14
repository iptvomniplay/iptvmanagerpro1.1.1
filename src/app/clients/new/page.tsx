'use client';

import * as React from 'react';
import { ClientForm } from '../components/client-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewClientPage() {
  const { t } = useLanguage();
  const [isFormVisible, setIsFormVisible] = React.useState(false);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('clientRegistration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            type="button"
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-48"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('addClient')}
          </Button>
          <div className={cn("pt-6", isFormVisible ? 'block' : 'hidden')}>
              <CardDescription>{t('registerNewClientDescription')}</CardDescription>
              <ClientForm client={null} onSubmitted={() => setIsFormVisible(false)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
