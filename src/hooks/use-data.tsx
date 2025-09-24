
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

const LOCAL_STORAGE_KEY_CLIENTS = 'iptv_manager_clients';
const LOCAL_STORAGE_KEY_SERVERS = 'iptv_manager_servers';
const LOCAL_STORAGE_KEY_CASHFLOW = 'iptv_manager_cashflow';
const LOCAL_STORAGE_KEY_NOTES = 'iptv_manager_notes';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  cashFlow: CashFlowEntry[];
  notes: Note[];
  isDataLoaded: boolean;
  isAuthenticated: boolean; // Keep for compatibility, but always true
  signIn: () => void;
  signOut: () => void;
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => void;
  updateClient: (clientData: Client, options?: { skipCashFlow?: boolean }) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Server) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
  updateTestInClient: (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => void;
  addTransactionToServer: (serverId: string, transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id' | 'date'>) => void;
  updateCashFlowEntry: (entry: CashFlowEntry) => void;
  deleteCashFlowEntry: (entryId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  exportData: () => void;
  importData: (file: File) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const clientsData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENTS) || '[]') as Client[];
      const serversData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_SERVERS) || '[]') as Server[];
      const cashFlowData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CASHFLOW) || '[]') as CashFlowEntry[];
      const notesData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_NOTES) || '[]') as Note[];
      
      setClients(clientsData);
      setServers(serversData);
      setCashFlow(cashFlowData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível buscar os dados salvos no seu navegador.',
      });
    } finally {
      setIsDataLoaded(true);
    }
  }, [toast]);
  
  const saveData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  const addCashFlowEntry = useCallback(
    (entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
      setCashFlow(prev => {
        const newEntry: CashFlowEntry = {
          ...entryData,
          id: `cf_${Date.now()}_${Math.random()}`,
          date: new Date().toISOString(),
        };
        const newState = [newEntry, ...prev];
        saveData(LOCAL_STORAGE_KEY_CASHFLOW, newState);
        return newState;
      });
    },
    []
  );
  
  const updateCashFlowEntry = useCallback((entryData: CashFlowEntry) => {
    setCashFlow(prev => {
      const newState = prev.map(entry => (entry.id === entryData.id ? entryData : entry));
      saveData(LOCAL_STORAGE_KEY_CASHFLOW, newState);
      return newState;
    });
  }, []);

  const deleteCashFlowEntry = useCallback((entryId: string) => {
    setCashFlow(prev => {
      const newState = prev.filter(entry => entry.id !== entryId);
      saveData(LOCAL_STORAGE_KEY_CASHFLOW, newState);
      return newState;
    });
  }, []);


  const addClient = useCallback(
    (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const newClient: Client = {
        ...(clientData as Client),
        _tempId: tempId,
        id: clientData.id || tempId,
        registeredDate: format(new Date(), 'yyyy-MM-dd'),
        birthDate: clientData.birthDate || '',
        plans: [],
      };
      setClients(prevClients => {
        const newState = [newClient, ...prevClients];
        saveData(LOCAL_STORAGE_KEY_CLIENTS, newState);
        return newState;
      });
    },
    []
  );

  const updateClient = useCallback(
    (clientData: Client, options?: { skipCashFlow?: boolean }) => {
      const previousClientState = clients.find(c => c._tempId === clientData._tempId);
      
      setClients(prevClients => {
        const newState = prevClients.map(c => (c._tempId === clientData._tempId ? clientData : c));
        saveData(LOCAL_STORAGE_KEY_CLIENTS, newState);
        return newState;
      });

      const handleAppActivationCashFlow = (oldApps: Application[], newApps: Application[]) => {
        for (const newApp of newApps) {
            const oldApp = oldApps.find(old => old.planId === newApp.planId && old.screenNumber === newApp.screenNumber);
            if (!oldApp && !newApp.isPreExisting && newApp.licenseType === 'Anual') {
                const sourceAppId = `${newApp.planId}-${newApp.screenNumber}`;
                if (newApp.chargedAmount && newApp.chargedAmount > 0) {
                    addCashFlowEntry({ type: 'income', amount: newApp.chargedAmount, description: `Receita de ativação: ${newApp.name} para ${clientData.name}`, clientId: clientData._tempId, clientName: clientData.name, sourceApplicationId: sourceAppId });
                }
                if (newApp.activationCost && newApp.activationCost > 0) {
                    addCashFlowEntry({ type: 'expense', amount: newApp.activationCost, description: `Custo de ativação: ${newApp.name} para ${clientData.name}`, clientId: clientData._tempId, clientName: clientData.name, sourceApplicationId: sourceAppId });
                }
            }
        }
    };
    
    if (previousClientState?.applications && clientData.applications) {
      handleAppActivationCashFlow(previousClientState.applications, clientData.applications);
    }
      
      if (!options?.skipCashFlow && clientData.status === 'Active' && previousClientState?.status !== 'Active' && clientData.plans) {
        const totalAmount = clientData.plans.reduce((sum, plan) => sum + (plan.isCourtesy ? 0 : plan.planValue), 0);
        if (totalAmount > 0) {
            addCashFlowEntry({
                type: 'income',
                amount: totalAmount,
                description: `Assinatura inicial - ${clientData.name}`,
                clientId: clientData._tempId,
                clientName: clientData.name,
            });
        }
        
        setServers(currentServers => {
          const serversToUpdate = new Map<string, Server>();

          clientData.plans?.forEach(plan => {
              const serverToUpdate = currentServers.find(s => s.id === plan.panel.id);
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
                      addCashFlowEntry({
                          type: 'expense',
                          amount: costOfConsumption,
                          description: `Custo do crédito: ${clientData.name} (${plan.plan.name})`,
                          clientId: clientData._tempId,
                          clientName: clientData.name,
                          sourceTransactionId: newTransaction.id,
                      });
                  }
              }
          });

          if (serversToUpdate.size > 0) {
            const newServersState = currentServers.map(s => serversToUpdate.get(s.id) || s);
            saveData(LOCAL_STORAGE_KEY_SERVERS, newServersState);
            return newServersState;
          }
          return currentServers;
        });
    }
    }, [clients, addCashFlowEntry]
  );
  
  const deleteClient = useCallback((tempId: string) => {
    setClients(prevClients => {
      const newState = prevClients.filter(c => c._tempId !== tempId);
      saveData(LOCAL_STORAGE_KEY_CLIENTS, newState);
      return newState;
    });
  }, []);

  const addServer = useCallback(
    (serverData: Server & { hasInitialPurchase?: boolean; initialCredits?: number; initialPurchaseValue?: number }) => {
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
          addCashFlowEntry({
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

      setServers(prevServers => {
        const newState = [newServer, ...prevServers];
        saveData(LOCAL_STORAGE_KEY_SERVERS, newState);
        return newState;
      });
      
      if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
        addCashFlowEntry({
          type: 'expense',
          amount: serverData.panelValue,
          description: `Pagamento do painel: ${serverData.name}`,
          sourceServerId: newServerId,
        });
      }
    },
    [addCashFlowEntry, t]
  );
  
  const updateServer = useCallback((serverData: Server) => {
    const oldServer = servers.find(s => s.id === serverData.id);
    
    setServers(prevServers => {
      const newState = prevServers.map(s => (s.id === serverData.id ? serverData : s));
      saveData(LOCAL_STORAGE_KEY_SERVERS, newState);
      return newState;
    });
    
    if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
      if (!oldServer || oldServer.panelValue !== serverData.panelValue) {
        const existingEntry = cashFlow.find(entry => entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'));
        if (existingEntry) {
          deleteCashFlowEntry(existingEntry.id);
        }
        addCashFlowEntry({
          type: 'expense',
          amount: serverData.panelValue!,
          description: `Pagamento do painel: ${serverData.name}`,
          sourceServerId: serverData.id
        });
      }
    } else if (serverData.paymentType !== 'postpaid' && oldServer?.paymentType === 'postpaid') {
      const existingEntry = cashFlow.find(entry => entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'));
      if (existingEntry) {
        deleteCashFlowEntry(existingEntry.id);
      }
    }
  }, [servers, cashFlow, addCashFlowEntry, deleteCashFlowEntry]);
  
  const deleteServer = useCallback((serverId: string) => {
    const clientsUsingServer = clients.filter(client => client.plans?.some(plan => plan.panel.id === serverId));
    if (clientsUsingServer.length > 0) {
        toast({ title: t('deleteServerWarningTitle'), description: t('deleteServerWarningDescription', { count: clientsUsingServer.length }) });
    }
    setServers(prevServers => {
      const newState = prevServers.filter(s => s.id !== serverId);
      saveData(LOCAL_STORAGE_KEY_SERVERS, newState);
      return newState;
    });
  }, [clients, t, toast]);
  
  const addTestToClient = useCallback((clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;

    const newTest: Test = {
      ...testData,
      creationDate: new Date().toISOString(),
    };
    
    const updatedTests = [...(client.tests || []), newTest];
    updateClient({ ...client, tests: updatedTests });
  }, [clients, updateClient]);
  
  const updateTestInClient = useCallback((clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;
    
    const newTests = (client.tests || []).map(test =>
      test.creationDate === testCreationDate ? { ...test, ...updatedTest } : test
    );
    updateClient({ ...client, tests: newTests });
  }, [clients, updateClient]);

  const addTransactionToServer = useCallback((serverId: string, transactionData: Omit<Transaction, 'id' | 'date'>) => {
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
        addCashFlowEntry({
            type: transactionData.totalValue > 0 ? 'expense' : 'income',
            amount: Math.abs(transactionData.totalValue),
            description: `${transactionData.description} - ${serverName}`,
            sourceTransactionId: newTransaction.id,
        });
    }
  }, [servers, t, toast, updateServer, addCashFlowEntry]);
  
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => {
      const newState = [newNote, ...prev];
      saveData(LOCAL_STORAGE_KEY_NOTES, newState);
      return newState;
    });
  }, []);
  
  const updateNote = useCallback((noteData: Note) => {
    setNotes(prev => {
      const newState = prev.map(n => (n.id === noteData.id ? noteData : n));
      saveData(LOCAL_STORAGE_KEY_NOTES, newState);
      return newState;
    });
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => {
      const newState = prev.filter(n => n.id !== noteId);
      saveData(LOCAL_STORAGE_KEY_NOTES, newState);
      return newState;
    });
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
  
  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error('File could not be read');
        
        const importedData = JSON.parse(result);
        if ( !Array.isArray(importedData.clients) || !Array.isArray(importedData.servers) || !Array.isArray(importedData.cashFlow) || !Array.isArray(importedData.notes) ) {
            throw new Error('Invalid backup file format');
        }

        setClients(importedData.clients);
        setServers(importedData.servers);
        setCashFlow(importedData.cashFlow);
        setNotes(importedData.notes);

        saveData(LOCAL_STORAGE_KEY_CLIENTS, importedData.clients);
        saveData(LOCAL_STORAGE_KEY_SERVERS, importedData.servers);
        saveData(LOCAL_STORAGE_KEY_CASHFLOW, importedData.cashFlow);
        saveData(LOCAL_STORAGE_KEY_NOTES, importedData.notes);

        toast({ title: t('backupImportedSuccess'), description: t('backupImportedSuccessDescription') });

      } catch (error) {
        console.error('Failed to import data:', error);
        toast({ variant: "destructive", title: t('backupImportFailed'), description: t('backupImportFailedDescription') });
      }
    };
    reader.readAsText(file);
  }, [t, toast]);
  
  const value: DataContextType = {
    clients,
    servers,
    cashFlow,
    notes,
    isDataLoaded,
    isAuthenticated,
    signIn: () => {}, // No-op
    signOut: () => {}, // No-op
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
