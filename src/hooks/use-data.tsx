'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan, Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  isDataLoaded: boolean;
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => void;
  updateClient: (clientData: Client) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Omit<Server, 'id' | 'status'>) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
  updateTestInClient: (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => void;
  addTransactionToServer: (serverId: string, transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side and loads data from localStorage.
    try {
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
         const clientsWithTempId = initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
         setClients(clientsWithTempId);
      }

      const storedServers = localStorage.getItem('servers');
      if (storedServers) {
        setServers(JSON.parse(storedServers));
      } else {
        setServers(initialServers);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      // Set initial data if localStorage fails
      const clientsWithTempId = initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
      setClients(clientsWithTempId);
      setServers(initialServers);
    } finally {
        setIsDataLoaded(true);
    }
  }, []);

  const saveDataToStorage = useCallback(<T,>(key: string, data: T[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => {
    setClients(prevClients => {
        const newClient: Client = {
            ...(clientData as Client),
            _tempId: `temp_${Date.now()}_${Math.random()}`,
            id: clientData.id || '',
            registeredDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: clientData.birthDate || '',
            plans: [],
        };
        const updatedClients = [newClient, ...prevClients];
        saveDataToStorage('clients', updatedClients);
        return updatedClients;
    });
  }, [saveDataToStorage]);

  const updateClient = useCallback((clientData: Client) => {
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c._tempId === clientData._tempId) ? { ...c, ...clientData } : c
      );
      saveDataToStorage('clients', updatedClients);
       return updatedClients;
    });
  }, [saveDataToStorage]);

  const deleteClient = useCallback((tempId: string) => {
    setClients(prevClients => {
      const updatedClients = prevClients.filter(c => c._tempId !== tempId);
      saveDataToStorage('clients', updatedClients);
      return updatedClients;
    });
  }, [saveDataToStorage]);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'status'>) => {
    setServers(prevServers => {
        const newServer: Server = {
        ...serverData,
        id: `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`,
        status: 'Online',
        subServers: serverData.subServers || [],
        transactions: [],
        };
        const updatedServers = [newServer, ...prevServers];
        saveDataToStorage('servers', updatedServers);
        return updatedServers;
    });
  }, [saveDataToStorage]);

  const updateServer = useCallback((serverData: Server) => {
    setServers(prevServers => {
      const updatedServers = prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s));
      saveDataToStorage('servers', updatedServers);
      return updatedServers;
    });
  }, [saveDataToStorage]);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => {
      const updatedServers = prevServers.filter(s => s.id !== serverId);
      saveDataToStorage('servers', updatedServers);
      return updatedServers;
    });
  }, [saveDataToStorage]);

  const addTestToClient = useCallback((clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const newTest: Test = {
      ...testData,
      creationDate: new Date().toISOString(),
    };
    setClients(prev => {
        const updatedClients = prev.map(client => {
            if (client.id === clientId || client._tempId === clientId) {
              return { ...client, tests: [...(client.tests || []), newTest] };
            }
            return client;
        });
        saveDataToStorage('clients', updatedClients);
        return updatedClients;
      }
    );
  }, [saveDataToStorage]);

  const updateTestInClient = useCallback((clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => {
    setClients(prev => {
      const updatedClients = prev.map(client => {
        if (client._tempId === clientId) {
          const newTests = (client.tests || []).map(test => {
            if (test.creationDate === testCreationDate) {
              return { ...test, ...updatedTest };
            }
            return test;
          });
          return { ...client, tests: newTests };
        }
        return client;
      });
      saveDataToStorage('clients', updatedClients);
      return updatedClients;
    });
  }, [saveDataToStorage]);

  const addTransactionToServer = useCallback((serverId: string, transactionData: Omit<Transaction, 'id' | 'date'>) => {
    setServers(prevServers => {
      const updatedServers = prevServers.map(server => {
        if (server.id === serverId) {
          const newTransaction: Transaction = {
            ...transactionData,
            id: `trans_${Date.now()}_${Math.random()}`,
            date: new Date().toISOString(),
          };
          const updatedTransactions = [...(server.transactions || []), newTransaction];
          const newCreditStock = server.creditStock + transactionData.credits;
          return { ...server, transactions: updatedTransactions, creditStock: newCreditStock };
        }
        return server;
      });
      saveDataToStorage('servers', updatedServers);
      return updatedServers;
    });
  }, [saveDataToStorage]);

  const value = {
    clients,
    servers,
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
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
