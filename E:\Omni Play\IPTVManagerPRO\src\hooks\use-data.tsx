'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import type {
  Client,
  Server,
  Test,
  Transaction,
  CashFlowEntry,
  Note,
  Application,
} from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';
import { useRouter } from 'next/navigation';

// Mock User ID para persistência local sem login
const LOCAL_USER_ID = 'local-user';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  cashFlow: CashFlowEntry[];
  notes: Note[];
  isDataLoaded: boolean;
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => Promise<void>;
  updateClient: (clientData: Client, options?: { skipCashFlow?: boolean }) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  addServer: (serverData: Server) => Promise<void>;
  updateServer: (serverData: Server) => Promise<void>;
  deleteServer: (serverId: string) => Promise<void>;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => Promise<void>;
  updateTestInClient: (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => Promise<void>;
  addTransactionToServer: (serverId: string, transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id' | 'date'>) => Promise<void>;
  updateCashFlowEntry: (entry: CashFlowEntry) => Promise<void>;
  deleteCashFlowEntry: (entryId: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  exportData: () => void;
  importData: (file: File) => void;
  signOut: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const loadFromLocalStorage = (key: string, fallback: any[]) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return fallback;
    }
};

const saveToLocalStorage = (key: string, value: any) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setClients(loadFromLocalStorage('clients_data', []));
    setServers(loadFromLocalStorage('servers_data', []));
    setCashFlow(loadFromLocalStorage('cashflow_data', []));
    setNotes(loadFromLocalStorage('notes_data', []));
    setIsDataLoaded(true);
  }, []);

  useEffect(() => { if (isDataLoaded) saveToLocalStorage('clients_data', clients); }, [clients, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveToLocalStorage('servers_data', servers); }, [servers, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveToLocalStorage('cashflow_data', cashFlow); }, [cashFlow, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveToLocalStorage('notes_data', notes); }, [notes, isDataLoaded]);


  const addCashFlowEntry = useCallback(async (entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
      const newEntry: CashFlowEntry = { ...entryData, id: `cf_${Date.now()}_${Math.random()}`, date: new Date().toISOString() };
      setCashFlow(prev => [newEntry, ...prev]);
  }, []);
  
  const updateCashFlowEntry = useCallback(async (entryData: CashFlowEntry) => {
    setCashFlow(prev => prev.map(entry => entry.id === entryData.id ? entryData : entry));
  }, []);

  const deleteCashFlowEntry = useCallback(async (entryId: string) => {
      setCashFlow(prev => prev.filter(entry => entry.id !== entryId));
  }, []);

  const addClient = useCallback(async (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
    const _tempId = `temp_${Date.now()}_${Math.random()}`;
    const newClient: Client = {
      ...(clientData as Client),
      _tempId,
      id: clientData.id || _tempId,
      registeredDate: format(new Date(), 'yyyy-MM-dd'),
      birthDate: clientData.birthDate || '',
      plans: [],
    };
    setClients(prev => [newClient, ...prev]);
  }, []);

  const updateClient = useCallback(async (clientData: Client, options?: { skipCashFlow?: boolean }) => {
    const previousClientState = clients.find(c => c._tempId === clientData._tempId);
    
    setClients(prevClients => prevClients.map(c => (c._tempId === clientData._tempId ? clientData : c)));
    
    const handleAppActivationCashFlow = async (oldApps: Application[], newApps: Application[]) => {
        for (const newApp of newApps) {
            const oldApp = oldApps.find(old => old.planId === newApp.planId && old.screenNumber === newApp.screenNumber);
            if (!oldApp && !newApp.isPreExisting && newApp.licenseType === 'Anual') {
                const sourceAppId = `${newApp.planId}-${newApp.screenNumber}`;
                if (newApp.chargedAmount && newApp.chargedAmount > 0) {
                    await addCashFlowEntry({ type: 'income', amount: newApp.chargedAmount, description: `Receita de ativação: ${newApp.name} para ${clientData.name}`, clientId: clientData._tempId, clientName: clientData.name, sourceApplicationId: sourceAppId });
                }
                if (newApp.activationCost && newApp.activationCost > 0) {
                    await addCashFlowEntry({ type: 'expense', amount: newApp.activationCost, description: `Custo de ativação: ${newApp.name} para ${clientData.name}`, clientId: clientData._tempId, clientName: clientData.name, sourceApplicationId: sourceAppId });
                }
            }
        }
    };
    
    if (previousClientState?.applications && clientData.applications) {
      await handleAppActivationCashFlow(previousClientState.applications, clientData.applications);
    }
      
    if (!options?.skipCashFlow && clientData.status === 'Active' && previousClientState?.status !== 'Active' && clientData.plans) {
        const totalAmount = clientData.plans.reduce((sum, plan) => sum + (plan.isCourtesy ? 0 : plan.planValue), 0);
        if (totalAmount > 0) {
            await addCashFlowEntry({
                type: 'income',
                amount: totalAmount,
                description: `Assinatura inicial - ${clientData.name}`,
                clientId: clientData._tempId,
                clientName: clientData.name,
            });
        }
        
        const serversToUpdate = new Map<string, Server>();
        const cashFlowPromises: Promise<void>[] = [];

        clientData.plans?.forEach(plan => {
            const serverToUpdate = servers.find(s => s.id === plan.panel.id);
            if (serverToUpdate) {
                const creditsToConsume = 1;
                const purchaseTransactions = (serverToUpdate.transactions || []).filter(t => t.type === 'purchase').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                let costOfConsumption = 0;
                if (purchaseTransactions.length > 0) {
                    costOfConsumption = creditsToConsume * purchaseTransactions[0].unitValue;
                }

                const newTransaction: Transaction = {
                    type: 'consumption',
                    credits: -creditsToConsume,
                    description: `Consumo para cliente ${clientData.name} (${plan.plan.name})`,
                    totalValue: -costOfConsumption,
                    unitValue: costOfConsumption,
                    id: `trans_${Date.now()}_${Math.random()}`,
                    date: new Date().toISOString(),
                };

                const updatedTransactions = [newTransaction, ...(serverToUpdate.transactions || [])];
                const newCreditStock = updatedTransactions.reduce((acc, trans) => acc + trans.credits, 0);

                const updatedServer = { ...serverToUpdate, transactions: updatedTransactions, creditStock: newCreditStock };
                serversToUpdate.set(serverToUpdate.id, updatedServer);

                if (costOfConsumption > 0) {
                    cashFlowPromises.push(addCashFlowEntry({
                        type: 'expense',
                        amount: costOfConsumption,
                        description: `Custo do crédito: ${clientData.name} (${plan.plan.name})`,
                        clientId: clientData._tempId,
                        clientName: clientData.name,
                        sourceTransactionId: newTransaction.id,
                    }));
                }
            }
        });

        serversToUpdate.forEach((server) => {
            setServers(prevServers => prevServers.map(s => s.id === server.id ? server : s));
        });
        await Promise.all(cashFlowPromises);
    }
  }, [clients, servers, addCashFlowEntry]);
  
  const deleteClient = useCallback(async (tempId: string) => {
    setClients(prev => prev.filter(c => c._tempId !== tempId));
  }, []);

  const addServer = useCallback(
    async (serverData: Server & { hasInitialPurchase?: boolean; initialCredits?: number; initialPurchaseValue?: number }) => {
      const newServerId = `S${Date.now()}${(Math.random() * 100).toFixed(0).padStart(3, '0')}`;
      let initialTransactions: Transaction[] = [];
      let creditStock = 0;

      if (serverData.hasInitialPurchase && serverData.initialCredits && serverData.initialPurchaseValue !== undefined) {
        const unitValue = serverData.initialCredits > 0 ? serverData.initialPurchaseValue / serverData.initialCredits : 0;
        const initialPurchase: Transaction = {
          id: `trans_${Date.now()}_${Math.random()}`,
          date: new Date().toISOString(),
          type: 'purchase',
          credits: serverData.initialCredits,
          totalValue: serverData.initialPurchaseValue,
          unitValue: unitValue,
          description: t('initialPurchase'),
        };
        initialTransactions.push(initialPurchase);
        creditStock = serverData.initialCredits;

        if (serverData.initialPurchaseValue > 0) {
          await addCashFlowEntry({
            type: 'expense',
            amount: serverData.initialPurchaseValue,
            description: `Compra de créditos: ${serverData.name}`,
            sourceTransactionId: initialPurchase.id,
          });
        }
      }

      const newServer: Server = {
        ...serverData,
        id: newServerId,
        status: 'Online',
        subServers: serverData.subServers || [],
        transactions: initialTransactions,
        creditStock: creditStock,
      };

      setServers(prevServers => [newServer, ...prevServers]);
      
      if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
        await addCashFlowEntry({
          type: 'expense',
          amount: serverData.panelValue,
          description: `Pagamento do painel: ${serverData.name}`,
          sourceServerId: newServerId,
        });
      }
    },
    [addCashFlowEntry, t]
  );
  
  const updateServer = useCallback(async (serverData: Server) => {
    const oldServer = servers.find(s => s.id === serverData.id);
    
    setServers(prevServers => prevServers.map(s => (s.id === serverData.id ? serverData : s)));
    
    if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
      if (!oldServer || oldServer.panelValue !== serverData.panelValue) {
        const existingEntryIndex = cashFlow.findIndex(entry => entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'));
        if (existingEntryIndex > -1) {
            setCashFlow(prev => prev.filter((_, i) => i !== existingEntryIndex));
        }

        await addCashFlowEntry({
          type: 'expense',
          amount: serverData.panelValue!,
          description: `Pagamento do painel: ${serverData.name}`,
          sourceServerId: serverData.id
        });
      }
    } else if (serverData.paymentType !== 'postpaid' && oldServer?.paymentType === 'postpaid') {
        setCashFlow(prev => prev.filter(entry => !(entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'))));
    }
  }, [servers, cashFlow, addCashFlowEntry]);
  
  const deleteServer = useCallback(async (serverId: string) => {
    const clientsUsingServer = clients.filter(client => client.plans?.some(plan => plan.panel.id === serverId));
    if (clientsUsingServer.length > 0) {
        toast({ title: t('deleteServerWarningTitle'), description: t('deleteServerWarningDescription', { count: clientsUsingServer.length }) });
    }
    setServers(prevServers => prevServers.filter(s => s.id !== serverId));
  }, [clients, t, toast]);
  
  const addTestToClient = useCallback(async (clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;

    const newTest: Test = { ...testData, creationDate: new Date().toISOString() };
    const updatedClient = { ...client, tests: [...(client.tests || []), newTest] };

    updateClient(updatedClient);
  }, [clients, updateClient]);
  
  const updateTestInClient = useCallback(async (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;
    
    const newTests = (client.tests || []).map(test =>
      test.creationDate === testCreationDate ? { ...test, ...updatedTest } : test
    );
    updateClient({ ...client, tests: newTests });
  }, [clients, updateClient]);

  const addTransactionToServer = useCallback(async (serverId: string, transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const serverName = server.name;
    const currentStock = server.creditStock;
    const finalQuantity = transactionData.credits;

    if (currentStock + finalQuantity < 0) {
      toast({ variant: "destructive", title: t('validationError'), description: t('negativeStockError') });
      return;
    }
    
    const newTransaction: Transaction = {
        ...transactionData,
        id: `trans_${Date.now()}_${Math.random()}`,
        date: new Date().toISOString(),
    };
    
    const updatedTransactions = [newTransaction, ...(server.transactions || [])];
    const newCreditStock = server.creditStock + newTransaction.credits;
    
    updateServer({ ...server, transactions: updatedTransactions, creditStock: newCreditStock });

    if (transactionData.totalValue !== 0) {
        await addCashFlowEntry({
            type: transactionData.totalValue > 0 ? 'expense' : 'income',
            amount: Math.abs(transactionData.totalValue),
            description: `${transactionData.description} - ${serverName}`,
            sourceTransactionId: newTransaction.id,
        });
    }
  }, [servers, t, toast, updateServer, addCashFlowEntry]);
  
  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = { ...noteData, id: `note_${Date.now()}_${Math.random()}`, createdAt: new Date().toISOString() };
    setNotes(prev => [newNote, ...prev]);
  }, []);
  
  const updateNote = useCallback(async (noteData: Note) => {
    setNotes(prev => prev.map(n => (n.id === noteData.id ? noteData : n)));
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  const exportData = useCallback(() => {
    const dataToExport = { clients, servers, cashFlow, notes };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = format(new Date(), 'yyyy-MM-dd');
    link.download = `iptv-manager-pro-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: t('backupExportedSuccess'), description: t('backupExportedSuccessDescription') });
  }, [clients, servers, cashFlow, notes, t, toast]);
  
  const importData = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error('File could not be read');
        
        const importedData = JSON.parse(result);
        if ( !Array.isArray(importedData.clients) || !Array.isArray(importedData.servers) || !Array.isArray(importedData.cashFlow) || !Array.isArray(importedData.notes) ) {
            throw new Error('Invalid backup file format');
        }
        
        setClients(importedData.clients || []);
        setServers(importedData.servers || []);
        setCashFlow(importedData.cashFlow || []);
        setNotes(importedData.notes || []);

        toast({ title: t('backupImportedSuccess'), description: t('backupImportedSuccessDescription') });

      } catch (error) {
        console.error('Failed to import data:', error);
        toast({ variant: "destructive", title: t('backupImportFailed'), description: t('backupImportFailedDescription') });
      }
    };
    reader.readAsText(file);
  }, [t, toast]);

  const signOut = useCallback(() => {
    // Apenas limpa os dados locais, já que não há login real
    setClients([]);
    setServers([]);
    setCashFlow([]);
    setNotes([]);
    // Redireciona para uma página "limpa", já que o login não existe mais
    router.push('/');
  }, [router]);
  
  const value: DataContextType = {
    clients,
    servers,
    cashFlow,
    notes,
    isDataLoaded,
    addClient,
    updateClient,
    deleteClient,
    addServer,
    updateServer,
    deleteServer,
    addTestToClient,
    updateTestInClient,
    addTransactionToServer,
    addCashFlowEntry,
    updateCashFlowEntry,
    deleteCashFlowEntry,
    addNote,
    updateNote,
    deleteNote,
    setNotes,
    exportData,
    importData,
    signOut,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
