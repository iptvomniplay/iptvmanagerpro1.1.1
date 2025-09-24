
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
const auth = getAuth(app);

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
  // Auth related functions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  
  // Force authentication for direct access
  const isAuthenticated = true;

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
    // Mock a user to bypass login, but still load data if a user were present
    const mockUser = { uid: 'temp-local-user' } as User;
    setUser(mockUser);
    
    const { clientsCol, serversCol, cashFlowCol, notesCol } = getCollections(mockUser.uid);
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
    toast({ title: "Login Desativado", description: "O login está temporariamente desativado." });
  };

  const signOutUser = async () => {
     toast({ title: "Logout Desativado", description: "O logout está temporariamente desativado." });
  };

  const withAuthCheck = useCallback(<T extends any[]>(func: (...args: T) => Promise<any>) => {
    return async (...args: T) => {
      // Always act as if there is a current user
      const currentUser = user || { uid: 'temp-local-user' };
      if (!currentUser) {
        toast({ variant: 'destructive', title: 'Não autenticado' });
        return;
      }
      return func(...args);
    };
  }, [toast, user]);

  const addCashFlowEntry = useCallback(withAuthCheck(async (entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
      const { cashFlowCol } = getCollections(user!.uid);
      const newEntry: CashFlowEntry = { ...entryData, id: `cf_${Date.now()}_${Math.random()}`, date: new Date().toISOString() };
      await setDoc(doc(cashFlowCol, newEntry.id), newEntry);
      setCashFlow(prev => [newEntry, ...prev]);
  }), [getCollections, user]);
  
  const updateCashFlowEntry = useCallback(withAuthCheck(async (entryData: CashFlowEntry) => {
    const { cashFlowCol } = getCollections(user!.uid);
    await setDoc(doc(cashFlowCol, entryData.id), entryData, { merge: true });
    setCashFlow(prev => prev.map(entry => entry.id === entryData.id ? entryData : entry));
  }), [getCollections, user]);

  const deleteCashFlowEntry = useCallback(withAuthCheck(async (entryId: string) => {
      const { cashFlowCol } = getCollections(user!.uid);
      await deleteDoc(doc(cashFlowCol, entryId));
      setCashFlow(prev => prev.filter(entry => entry.id !== entryId));
  }), [getCollections, user]);

  const addClient = useCallback(withAuthCheck(async (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
    const { clientsCol } = getCollections(user!.uid);
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
  }), [getCollections, user]);

  const updateClient = useCallback(withAuthCheck(async (clientData: Client, options?: { skipCashFlow?: boolean }) => {
    const { clientsCol, serversCol } = getCollections(user!.uid);
    await setDoc(doc(clientsCol, clientData._tempId), clientData, { merge: true });
    setClients(prevClients => prevClients.map(c => (c._tempId === clientData._tempId ? clientData : c)));
  }), [getCollections, user]);
  
  const deleteClient = useCallback(withAuthCheck(async (tempId: string) => {
    const { clientsCol } = getCollections(user!.uid);
    await deleteDoc(doc(clientsCol, tempId));
    setClients(prev => prev.filter(c => c._tempId !== tempId));
  }), [getCollections, user]);

  const addServer = useCallback(withAuthCheck(async (serverData: Server & { hasInitialPurchase?: boolean; initialCredits?: number; initialPurchaseValue?: number }) => {
    const { serversCol } = getCollections(user!.uid);
    const newServerId = `S${Date.now()}${(Math.random() * 100).toFixed(0).padStart(3, '0')}`;
    const newServer: Server = { ...serverData, id: newServerId, status: 'Online' };
    await setDoc(doc(serversCol, newServer.id), newServer);
    setServers(prev => [newServer, ...prev]);
  }), [getCollections, user]);

  const updateServer = useCallback(withAuthCheck(async (serverData: Server) => {
    const { serversCol } = getCollections(user!.uid);
    await setDoc(doc(serversCol, serverData.id), serverData, { merge: true });
    setServers(prev => prev.map(s => (s.id === serverData.id ? serverData : s)));
  }), [getCollections, user]);
  
  const deleteServer = useCallback(withAuthCheck(async (serverId: string) => {
      const { serversCol } = getCollections(user!.uid);
      await deleteDoc(doc(serversCol, serverId));
      setServers(prev => prev.filter(s => s.id !== serverId));
  }), [getCollections, user]);
  
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
    const { notesCol } = getCollections(user!.uid);
    const newNote: Note = { ...noteData, id: `note_${Date.now()}_${Math.random()}`, createdAt: new Date().toISOString() };
    await setDoc(doc(notesCol, newNote.id), newNote);
    setNotes(prev => [newNote, ...prev]);
  }), [getCollections, user]);

  const updateNote = useCallback(withAuthCheck(async (noteData: Note) => {
    const { notesCol } = getCollections(user!.uid);
    await setDoc(doc(notesCol, noteData.id), noteData, { merge: true });
    setNotes(prev => prev.map(n => (n.id === noteData.id ? noteData : n)));
  }), [getCollections, user]);

  const deleteNote = useCallback(withAuthCheck(async (noteId: string) => {
    const { notesCol } = getCollections(user!.uid);
    await deleteDoc(doc(notesCol, noteId));
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }), [getCollections, user]);
  
  const exportData = useCallback(() => {
    if (!user) return;
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
  }, [clients, servers, cashFlow, notes, t, toast, user]);
  
  const importData = useCallback(async (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error('File could not be read');
        
        const importedData = JSON.parse(result);
        if (!Array.isArray(importedData.clients) || !Array.isArray(importedData.servers) || !Array.isArray(importedData.cashFlow) || !Array.isArray(importedData.notes)) {
            throw new Error('Invalid backup file format');
        }
        
        const { clientsCol, serversCol, cashFlowCol, notesCol } = getCollections(user.uid);
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
  }, [getCollections, t, toast, user]);

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
