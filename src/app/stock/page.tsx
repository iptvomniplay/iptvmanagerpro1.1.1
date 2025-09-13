'use client';

import { useLanguage } from '@/hooks/use-language';

export default function StockPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('stockRegistration')}</h1>
      </div>
    </div>
  );
}
