
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
}
