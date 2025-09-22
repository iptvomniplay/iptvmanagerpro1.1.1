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
        <Link href="/utilities/notepad" className="group">
          <Card className="cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20 hover:shadow-lg h-full flex flex-col">
            <CardHeader className="flex-1">
                <div className="mb-4">
                  <StickyNote className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('notepad')}</CardTitle>
                <CardDescription className="text-base">{t('notepadDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              
            </CardContent>
          </Card>
        </Link>
        <Link href="/utilities/assistant" className="group">
          <Card className="cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20 hover:shadow-lg h-full flex flex-col">
            <CardHeader className="flex-1">
                <div className="mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('virtualAssistant')}</CardTitle>
                <CardDescription className="text-base">{t('virtualAssistantDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
