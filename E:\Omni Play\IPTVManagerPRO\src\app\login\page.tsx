'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tv2 } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center space-y-8 text-center">
        <div className="flex items-center gap-4 text-primary">
          <Tv2 className="h-16 w-16" />
          <h1 className="text-4xl font-bold">IPTV Manager Pro</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          O login está temporariamente desativado. Você pode acessar a aplicação diretamente.
        </p>
        <Button asChild size="lg">
            <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  );
}
