'use client';

import * as React from 'react';
import type { Client } from '@/lib/types';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

interface PersistenceTestProps {
  selectedClient: Client | null;
}

const TestResultItem: React.FC<{ title: string; value: string | null | undefined; expected: string | null | undefined, isInitial: boolean }> = ({ title, value, expected, isInitial }) => {
  const { t } = useLanguage();
  let Icon = XCircle;
  let text = `ID: ${value || '"vazio"'}`;
  let color = 'text-destructive';

  if (isInitial) {
    Icon = AlertCircle;
    text = "Aguardando ID ser salvo...";
    color = "text-yellow-500";
  } else if (value && value === expected) {
    Icon = CheckCircle;
    color = 'text-green-500';
  } else {
     text = `Incorreto. Esperado: "${expected || 'vazio'}", Recebido: "${value || 'vazio'}"`;
  }

  return (
    <div className={`flex items-center gap-2 text-base font-semibold ${color}`}>
      <Icon className="h-5 w-5" />
      <span className="font-bold">{title}:</span>
      <span>{text}</span>
    </div>
  );
};


export function PersistenceTest({ selectedClient }: PersistenceTestProps) {
  const { t } = useLanguage();
  const { clients: globalClients } = useData();
  const [manualIdUsedInTest, setManualIdUsedInTest] = React.useState<string | null>(null);
  const [storedClient, setStoredClient] = React.useState<Client | null>(null);
  const [globalClient, setGlobalClient] = React.useState<Client | null>(null);
  
  const clientKey = selectedClient?._tempId;

  const runTest = () => {
    if (!selectedClient || !clientKey) return;
    
    setManualIdUsedInTest(selectedClient.id);

    // 1. Check global client list
    const clientFromGlobalList = globalClients.find(c => c._tempId === clientKey) || null;
    setGlobalClient(clientFromGlobalList);
    
    // 2. Check localStorage
    const storedClientsRaw = localStorage.getItem('clients');
    if (storedClientsRaw) {
      try {
        const storedClientsParsed: Client[] = JSON.parse(storedClientsRaw);
        const clientFromStorage = storedClientsParsed.find(c => c._tempId === clientKey) || null;
        setStoredClient(clientFromStorage);
      } catch (e) {
        setStoredClient(null);
      }
    } else {
      setStoredClient(null);
    }
  };

  React.useEffect(() => {
    // Reset test when client changes
    setManualIdUsedInTest(null);
    setStoredClient(null);
    setGlobalClient(null);
  }, [selectedClient]);

  const isTestInitialState = manualIdUsedInTest === null;

  return (
    <Card className="mt-6 border-dashed border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Teste de Persistência do ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={!selectedClient} className="w-full">
            Rodar Teste de Comparação Agora
        </Button>
        <div className="space-y-3 rounded-md bg-muted/50 p-4">
            <TestResultItem 
                title="1. Estado do Componente (selectedClient)"
                value={selectedClient?.id}
                expected={manualIdUsedInTest}
                isInitial={isTestInitialState}
            />
            <TestResultItem 
                title="2. Lista Global (useData)"
                value={globalClient?.id}
                expected={manualIdUsedInTest}
                isInitial={isTestInitialState}
            />
            <TestResultItem 
                title="3. localStorage ('clients')"
                value={storedClient?.id}
                expected={manualIdUsedInTest}
                isInitial={isTestInitialState}
            />
        </div>
      </CardContent>
    </Card>
  );
}
