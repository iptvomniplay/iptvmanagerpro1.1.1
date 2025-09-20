'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TestModal } from '../components/test-modal';

export default function ViewTestsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('testes')}</CardTitle>
            <CardDescription>
              {t('testManagementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setIsTestModalOpen(true)} size="lg">
              {t('addTest')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('viewAllTests')}</CardTitle>
            <CardDescription>{t('underDevelopment')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t('awaitingInput')}</p>
          </CardContent>
        </Card>
      </div>
      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </>
  );
}
