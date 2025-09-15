'use client';

import * as React from 'react';
import { ClientForm } from '../components/client-form';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronsDown, ChevronsUp } from 'lucide-react';
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
        <CardContent className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={() => setIsFormVisible(true)}
              className="w-48"
              disabled={isFormVisible}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('addClient')}
            </Button>

            {isFormVisible && (
              <Button
                variant="ghost"
                onClick={() => setIsFormVisible(!isFormVisible)}
              >
                {isFormVisible ? (
                  <>
                    <ChevronsUp className="mr-2 h-5 w-5" />
                    {t('collapse')}
                  </>
                ) : (
                  <>
                    <ChevronsDown className="mr-2 h-5 w-5" />
                    {t('expand')}
                  </>
                )}
              </Button>
            )}
          </div>
          <div className={cn("pt-6", isFormVisible ? 'block' : 'hidden')}>
              <CardDescription>{t('registerNewClientDescription')}</CardDescription>
              <ClientForm client={null} onSubmitted={() => setIsFormVisible(false)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
