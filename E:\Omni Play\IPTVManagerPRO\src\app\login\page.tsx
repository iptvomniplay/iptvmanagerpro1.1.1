
'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Tv2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function LoginPage() {
  const { signIn } = useData();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center space-y-8">
        <div className="flex items-center gap-4 text-primary">
          <Tv2 className="h-16 w-16" />
          <h1 className="text-4xl font-bold">IPTV Manager Pro</h1>
        </div>
        <p className="text-center text-lg text-muted-foreground">
          {t('welcomeMessage')}
        </p>
        <Button onClick={signIn} size="lg" className="w-full">
          {t('signInWithGoogle')}
        </Button>
      </div>
    </div>
  );
}
