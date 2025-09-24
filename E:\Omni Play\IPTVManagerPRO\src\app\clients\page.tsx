
'use client';

import ClientsPageContent from './components/clients-page-content';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/components/layout/app-layout';

export default function ClientsPage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('clientManagement')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t('clientManagementDescription')}
          </p>
        </div>
        <ClientsPageContent />
      </div>
    </AppLayout>
  );
}
