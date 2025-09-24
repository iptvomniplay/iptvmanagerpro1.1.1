
'use client';

import * as React from 'react';
import AppLayout from './app-layout';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // O AuthGuard agora simplesmente renderiza o layout principal com o conteúdo,
  // bypassando completamente qualquer verificação de autenticação.
  return <AppLayout>{children}</AppLayout>;
}

    