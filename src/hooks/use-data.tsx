'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
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
import { app } from '@/lib/firebase'; // Import your Firebase app instance

// Initialize Firestore
const db = getFirestore(app);

const clientsCol = collection(db, 'clients');
const serversCol = collection(db, 'servers');
const cashFlowCol = collection(db, 'cashFlow');
const notesCol = collection(db, 'notes');

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
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = useCallback(async () => {
    try {
      const [
        clientsSnapshot,
        serversSnapshot,
        cashFlowSnapshot,
        notesSnapshot,
      ] = await Promise.all([
        getDocs(clientsCol),
        getDocs(serversCol),
        getDocs(cashFlowCol),
        getDocs(notesCol),
      ]);

      const clientsData = clientsSnapshot.docs.map(doc => doc.data() as Client);
      const serversData = serversSnapshot.docs.map(doc => doc.data() as Server);
      const cashFlowData = cashFlowSnapshot.docs.map(
        doc => doc.data() as CashFlowEntry
      );
      const notesData = notesSnapshot.docs.map(doc => doc.data() as Note);

      setClients(clientsData);
      setServers(serversData);
      setCashFlow(cashFlowData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load data from Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description:
          'Não foi possível buscar os dados da nuvem. Verifique sua conexão.',
      });
    } finally {
      setIsDataLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addCashFlowEntry = useCallback(
    async (entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
      const newEntry: CashFlowEntry = {
        ...entryData,
        id: `cf_${Date.now()}_${Math.random()}`,
        date: new Date().toISOString(),
      };
      await setDoc(doc(cashFlowCol, newEntry.id), newEntry);
      setCashFlow(prev => [newEntry, ...prev]);
    },
    []
  );
  
  const updateCashFlowEntry = useCallback(async (entryData: CashFlowEntry) => {
    await setDoc(doc(cashFlowCol, entryData.id), entryData, { merge: true });
    setCashFlow(prev =>
      prev.map(entry => (entry.id === entryData.id ? entryData : entry))
    );
  }, []);

  const deleteCashFlowEntry = useCallback(async (entryId: string) => {
    await deleteDoc(doc(cashFlowCol, entryId));
    setCashFlow(prev => prev.filter(entry => entry.id !== entryId));
  }, []);


  const addClient = useCallback(
    async (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const newClient: Client = {
        ...(clientData as Client),
        _tempId: tempId,
        id: clientData.id || tempId, // Use tempId if manual ID is not provided
        registeredDate: format(new Date(), 'yyyy-MM-dd'),
        birthDate: clientData.birthDate || '',
        plans: [],
      };
      await setDoc(doc(clientsCol, newClient._tempId), newClient);
      setClients(prevClients => [newClient, ...prevClients]);
    },
    []
  );

 const updateClient = useCallback(
    async (clientData: Client, options?: { skipCashFlow?: boolean }) => {
      const previousClientState = clients.find(c => c._tempId === clientData._tempId);

      await setDoc(doc(clientsCol, clientData._tempId), clientData, { merge: true });
       setClients(prevClients =>
        prevClients.map(c => (c._tempId === clientData._tempId ? clientData : c))
      );

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
        
        // This part needs careful handling of state updates
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

        const batch = writeBatch(db);
        serversToUpdate.forEach((server, id) => {
            batch.set(doc(serversCol, id), server, { merge: true });
        });
        await Promise.all([batch.commit(), ...cashFlowPromises]);

        setServers(prevServers => prevServers.map(s => serversToUpdate.get(s.id) || s));
    }
    }, [clients, servers, addCashFlowEntry]
  );
  
  const deleteClient = useCallback(async (tempId: string) => {
    await deleteDoc(doc(clientsCol, tempId));
    setClients(prevClients => prevClients.filter(c => c._tempId !== tempId));
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

      await setDoc(doc(serversCol, newServer.id), newServer);
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
    
    await setDoc(doc(serversCol, serverData.id), serverData, { merge: true });
    setServers(prevServers => prevServers.map(s => (s.id === serverData.id ? serverData : s)));
    
    if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
      if (!oldServer || oldServer.panelValue !== serverData.panelValue) {
        const existingEntries = cashFlow.filter(entry => entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'));
        const batch = writeBatch(db);
        existingEntries.forEach(entry => batch.delete(doc(cashFlowCol, entry.id)));
        await batch.commit();

        await addCashFlowEntry({
          type: 'expense',
          amount: serverData.panelValue!,
          description: `Pagamento do painel: ${serverData.name}`,
          sourceServerId: serverData.id
        });
      }
    } else if (serverData.paymentType !== 'postpaid' && oldServer?.paymentType === 'postpaid') {
        const existingEntries = cashFlow.filter(entry => entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'));
        const batch = writeBatch(db);
        existingEntries.forEach(entry => batch.delete(doc(cashFlowCol, entry.id)));
        await batch.commit();
        setCashFlow(prev => prev.filter(entry => !(entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'))));
    }
  }, [servers, cashFlow, addCashFlowEntry]);
  
  const deleteServer = useCallback(async (serverId: string) => {
    const clientsUsingServer = clients.filter(client => client.plans?.some(plan => plan.panel.id === serverId));
    if (clientsUsingServer.length > 0) {
        toast({ title: t('deleteServerWarningTitle'), description: t('deleteServerWarningDescription', { count: clientsUsingServer.length }) });
    }
    await deleteDoc(doc(serversCol, serverId));
    setServers(prevServers => prevServers.filter(s => s.id !== serverId));
  }, [clients, t, toast]);
  
  const addTestToClient = useCallback(async (clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;

    const newTest: Test = {
      ...testData,
      creationDate: new Date().toISOString(),
    };
    
    const updatedTests = [...(client.tests || []), newTest];
    const updatedClient = { ...client, tests: updatedTests };

    await updateClient(updatedClient);
  }, [clients, updateClient]);
  
  const updateTestInClient = useCallback(async (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;
    
    const newTests = (client.tests || []).map(test =>
      test.creationDate === testCreationDate ? { ...test, ...updatedTest } : test
    );
    await updateClient({ ...client, tests: newTests });
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
    
    await updateServer({ ...server, transactions: updatedTransactions, creditStock: newCreditStock });

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
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(notesCol, newNote.id), newNote);
    setNotes(prev => [newNote, ...prev]);
  }, []);
  
  const updateNote = useCallback(async (noteData: Note) => {
    await setDoc(doc(notesCol, noteData.id), noteData, { merge: true });
    setNotes(prev => prev.map(n => (n.id === noteData.id ? noteData : n)));
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    await deleteDoc(doc(notesCol, noteId));
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

        const batch = writeBatch(db);

        // Clear existing data
        const existingDocs = await Promise.all([ getDocs(clientsCol), getDocs(serversCol), getDocs(cashFlowCol), getDocs(notesCol) ]);
        existingDocs.forEach(snapshot => snapshot.forEach(doc => batch.delete(doc.ref)));
        
        // Add new data
        importedData.clients.forEach((item: Client) => batch.set(doc(clientsCol, item._tempId), item));
        importedData.servers.forEach((item: Server) => batch.set(doc(serversCol, item.id), item));
        importedData.cashFlow.forEach((item: CashFlowEntry) => batch.set(doc(cashFlowCol, item.id), item));
        importedData.notes.forEach((item: Note) => batch.set(doc(notesCol, item.id), item));

        await batch.commit();
        
        // Update state
        setClients(importedData.clients);
        setServers(importedData.servers);
        setCashFlow(importedData.cashFlow);
        setNotes(importedData.notes);

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
