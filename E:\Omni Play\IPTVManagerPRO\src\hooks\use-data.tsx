'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
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
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const db = getFirestore(app);

interface DataContextType {
  clients: Client[];
  servers: Server[];
  cashFlow: CashFlowEntry[];
  notes: Note[];
  isDataLoaded: boolean;
  user: User | null;
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
  isAuthenticated: boolean; // Mantido para compatibilidade, mas sempre será true
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock User ID para persistência local sem login
const LOCAL_USER_ID = 'local-user';

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // O usuário é simulado e a autenticação é sempre considerada verdadeira.
  const [user] = useState<User | null>({ uid: LOCAL_USER_ID } as User);
  const isAuthenticated = true;

  const { toast } = useToast();
  const { t } = useLanguage();

  const getCollections = useCallback((userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    return {
      clientsCol: collection(userDocRef, 'clients'),
      serversCol: collection(userDocRef, 'servers'),
      cashFlowCol: collection(userDocRef, 'cashFlow'),
      notesCol: collection(userDocRef, 'notes'),
    };
  }, []);

  useEffect(() => {
    const { clientsCol, serversCol, cashFlowCol, notesCol } = getCollections(LOCAL_USER_ID);
    const fetchData = async () => {
        try {
          const [clientsSnapshot, serversSnapshot, cashFlowSnapshot, notesSnapshot] = await Promise.all([
            getDocs(clientsCol),
            getDocs(serversCol),
            getDocs(cashFlowCol),
            getDocs(notesCol),
          ]);
          setClients(clientsSnapshot.docs.map(doc => doc.data() as Client));
          setServers(serversSnapshot.docs.map(doc => doc.data() as Server));
          setCashFlow(cashFlowSnapshot.docs.map(doc => doc.data() as CashFlowEntry));
          setNotes(notesSnapshot.docs.map(doc => doc.data() as Note));
        } catch (error) {
          console.error("Failed to load data from Firestore", error);
          toast({ variant: "destructive", title: "Erro ao carregar dados" });
        } finally {
            setIsDataLoaded(true);
        }
    }
    fetchData();
  }, [getCollections, toast]);

  const signIn = async () => {
    toast({ title: "Login Desativado", description: "O login está desativado para acesso direto." });
  };

  const signOutUser = async () => {
     toast({ title: "Logout Desativado", description: "O logout está desativado." });
  };

  const withAuthCheck = useCallback(<T extends any[]>(func: (...args: T) => Promise<any>) => {
    return async (...args: T) => {
      // Como a autenticação está desativada, executa a função diretamente.
      return func(...args);
    };
  }, []);

  const addCashFlowEntry = useCallback(withAuthCheck(async (entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
      const { cashFlowCol } = getCollections(LOCAL_USER_ID);
      const newEntry: CashFlowEntry = { ...entryData, id: `cf_${Date.now()}_${Math.random()}`, date: new Date().toISOString() };
      await setDoc(doc(cashFlowCol, newEntry.id), newEntry);
      setCashFlow(prev => [newEntry, ...prev]);
  }), [getCollections]);
  
  const updateCashFlowEntry = useCallback(withAuthCheck(async (entryData: CashFlowEntry) => {
    const { cashFlowCol } = getCollections(LOCAL_USER_ID);
    await setDoc(doc(cashFlowCol, entryData.id), entryData, { merge: true });
    setCashFlow(prev => prev.map(entry => entry.id === entryData.id ? entryData : entry));
  }), [getCollections]);

  const deleteCashFlowEntry = useCallback(withAuthCheck(async (entryId: string) => {
      const { cashFlowCol } = getCollections(LOCAL_USER_ID);
      await deleteDoc(doc(cashFlowCol, entryId));
      setCashFlow(prev => prev.filter(entry => entry.id !== entryId));
  }), [getCollections]);

  const addClient = useCallback(withAuthCheck(async (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
    const { clientsCol } = getCollections(LOCAL_USER_ID);
    const _tempId = `temp_${Date.now()}_${Math.random()}`;
    const newClient: Client = {
      ...(clientData as Client),
      _tempId,
      id: clientData.id || _tempId,
      registeredDate: format(new Date(), 'yyyy-MM-dd'),
      birthDate: clientData.birthDate || '',
      plans: [],
    };
    await setDoc(doc(clientsCol, newClient._tempId), newClient);
    setClients(prev => [newClient, ...prev]);
  }), [getCollections]);

  const updateClient = useCallback(withAuthCheck(async (clientData: Client, options?: { skipCashFlow?: boolean }) => {
    const { clientsCol } = getCollections(LOCAL_USER_ID);
    await setDoc(doc(clientsCol, clientData._tempId), clientData, { merge: true });
    setClients(prevClients => prevClients.map(c => (c._tempId === clientData._tempId ? clientData : c)));
  }), [getCollections]);
  
  const deleteClient = useCallback(withAuthCheck(async (tempId: string) => {
    const { clientsCol } = getCollections(LOCAL_USER_ID);
    await deleteDoc(doc(clientsCol, tempId));
    setClients(prev => prev.filter(c => c._tempId !== tempId));
  }), [getCollections]);

  const addServer = useCallback(withAuthCheck(async (serverData: Server & { hasInitialPurchase?: boolean; initialCredits?: number; initialPurchaseValue?: number }) => {
    const { serversCol } = getCollections(LOCAL_USER_ID);
    const newServerId = `S${Date.now()}${(Math.random() * 100).toFixed(0).padStart(3, '0')}`;
    const newServer: Server = { ...serverData, id: newServerId, status: 'Online' };
    await setDoc(doc(serversCol, newServer.id), newServer);
    setServers(prev => [newServer, ...prev]);
  }), [getCollections]);

  const updateServer = useCallback(withAuthCheck(async (serverData: Server) => {
    const { serversCol } = getCollections(LOCAL_USER_ID);
    await setDoc(doc(serversCol, serverData.id), serverData, { merge: true });
    setServers(prev => prev.map(s => (s.id === serverData.id ? serverData : s)));
  }), [getCollections]);
  
  const deleteServer = useCallback(withAuthCheck(async (serverId: string) => {
      const { serversCol } = getCollections(LOCAL_USER_ID);
      await deleteDoc(doc(serversCol, serverId));
      setServers(prev => prev.filter(s => s.id !== serverId));
  }), [getCollections]);
  
  const addTestToClient = useCallback(async (clientId: string, testData: Omit<Test, 'creationDate'>) => {
      const client = clients.find(c => c._tempId === clientId);
      if (!client) return;
      const newTest: Test = { ...testData, creationDate: new Date().toISOString() };
      const updatedClient = { ...client, tests: [...(client.tests || []), newTest] };
      await updateClient(updatedClient);
  }, [clients, updateClient]);
  
  const updateTestInClient = useCallback(async (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => {
    const client = clients.find(c => c._tempId === clientId);
    if (!client) return;
    const newTests = (client.tests || []).map(test => test.creationDate === testCreationDate ? { ...test, ...updatedTest } : test);
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
  
  const addNote = useCallback(withAuthCheck(async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const { notesCol } = getCollections(LOCAL_USER_ID);
    const newNote: Note = { ...noteData, id: `note_${Date.now()}_${Math.random()}`, createdAt: new Date().toISOString() };
    await setDoc(doc(notesCol, newNote.id), newNote);
    setNotes(prev => [newNote, ...prev]);
  }), [getCollections]);

  const updateNote = useCallback(withAuthCheck(async (noteData: Note) => {
    const { notesCol } = getCollections(LOCAL_USER_ID);
    await setDoc(doc(notesCol, noteData.id), noteData, { merge: true });
    setNotes(prev => prev.map(n => (n.id === noteData.id ? noteData : n)));
  }), [getCollections]);

  const deleteNote = useCallback(withAuthCheck(async (noteId: string) => {
    const { notesCol } = getCollections(LOCAL_USER_ID);
    await deleteDoc(doc(notesCol, noteId));
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }), [getCollections]);
  
  const exportData = useCallback(() => {
    const dataToExport = { clients, servers, cashFlow, notes };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = format(new Date(), 'yyyy-MM-dd');
    link.download = `iptv-manager-pro-backup-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
    toast({ title: t('backupExportedSuccess'), description: t('backupExportedSuccessDescription') });
  }, [clients, servers, cashFlow, notes, t, toast]);
  
  const importData = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error('File could not be read');
        
        const importedData = JSON.parse(result);
        if (!Array.isArray(importedData.clients) || !Array.isArray(importedData.servers) || !Array.isArray(importedData.cashFlow) || !Array.isArray(importedData.notes)) {
            throw new Error('Invalid backup file format');
        }
        
        const { clientsCol, serversCol, cashFlowCol, notesCol } = getCollections(LOCAL_USER_ID);
        const batch = writeBatch(db);

        const existingSnapshots = await Promise.all([ getDocs(clientsCol), getDocs(serversCol), getDocs(cashFlowCol), getDocs(notesCol) ]);
        existingSnapshots.forEach(snapshot => snapshot.forEach(doc => batch.delete(doc.ref)));
        
        importedData.clients.forEach((item: Client) => batch.set(doc(clientsCol, item._tempId), item));
        importedData.servers.forEach((item: Server) => batch.set(doc(serversCol, item.id), item));
        importedData.cashFlow.forEach((item: CashFlowEntry) => batch.set(doc(cashFlowCol, item.id), item));
        importedData.notes.forEach((item: Note) => batch.set(doc(notesCol, item.id), item));

        await batch.commit();
        
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
  }, [getCollections, t, toast]);

  return (
    <DataContext.Provider value={{
      clients, servers, cashFlow, notes, isDataLoaded, user,
      addClient, updateClient, deleteClient, addServer, updateServer,
      deleteServer, addTestToClient, updateTestInClient, addTransactionToServer,
      addCashFlowEntry, updateCashFlowEntry, deleteCashFlowEntry, addNote,
      updateNote, deleteNote, setNotes, exportData, importData,
      signIn, signOut: signOutUser, isAuthenticated,
    }}>{children}</DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
