'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StickyNote, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function UtilitiesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('utilities')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('utilitiesDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link href="/utilities/notepad">
          <Card className="group cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-xl">{t('notepad')}</CardTitle>
                    <CardDescription>{t('notepadDescription')}</CardDescription>
                </div>
                <ChevronRight className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
