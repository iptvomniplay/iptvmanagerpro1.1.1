
'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StickyNote, ChevronRight, Bot } from 'lucide-react';
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Link href="/utilities/notepad" className="no-underline">
            <Card className="h-full flex flex-col hover:border-primary transition-all">
                <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                        <StickyNote className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>{t('notepad')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-muted-foreground">{t('notepadDescription')}</p>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end">
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
            </Card>
        </Link>
      </div>
    </div>
  );
}
