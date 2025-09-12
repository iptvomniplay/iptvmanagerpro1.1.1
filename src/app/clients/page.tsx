'use client';

import { clients } from '@/lib/data';
import ClientsPageContent from './components/clients-page-content';
import { useLanguage } from '@/hooks/use-language';

export default function ClientsPage() {
  const { t } = useLanguage();
  // In a real app, you'd fetch this data from an API or database.
  const clientsData = clients;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('clientManagement')}</h1>
        <p className="text-muted-foreground">
          {t('clientManagementDescription')}
        </p>
      </div>
      <ClientsPageContent initialClients={clientsData} />
    </div>
  );
}
