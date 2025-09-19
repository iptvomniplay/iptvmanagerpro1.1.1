'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan } from '@/lib/types';
import { format } from 'date-fns';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | 'id'>) => void;
  updateClient: (clientData: Client, skipSave?: boolean) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Omit<Server, 'id' | 'status'>) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
  saveClientsToStorage: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const safelyParseJSON = (jsonString: string | null, fallback: any) => {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
        // This reviver can be used to convert date strings back to Date objects if needed
        return value;
    });
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error("Failed to parse JSON from localStorage", e);
    return fallback;
  }
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

   useEffect(() => {
    // Load data from localStorage on initial mount
    const storedClients = localStorage.getItem('clients');
    const storedServers = localStorage.getItem('servers');
    setClients(safelyParseJSON(storedClients, []));
    setServers(safelyParseJSON(storedServers, []));
    setIsDataLoaded(true);
  }, []);
  
  const saveClientsToStorage = useCallback(() => {
    if (isDataLoaded) {
      localStorage.setItem('clients', JSON.stringify(clients));
    }
  }, [clients, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('servers', JSON.stringify(servers));
    }
  }, [servers, isDataLoaded]);


  const addClient = useCallback((clientData: Omit<Client, 'registeredDate' | 'plans' | 'id'>) => {
    setClients(prevClients => {
        const newClient: Client = {
            ...(clientData as Client),
            id: '', // ID will be set manually by the user
            registeredDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: clientData.birthDate || '',
            plans: [],
        };
        const updatedClients = [newClient, ...prevClients];
        localStorage.setItem('clients', JSON.stringify(updatedClients));
        return updatedClients;
    });
  }, []);

  const updateClient = useCallback((clientData: Client, skipSave = false) => {
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c.id && c.id === clientData.id) || (c._tempId && c._tempId === clientData._tempId)
          ? { ...c, ...clientData } 
          : c
      );
       if (!skipSave) {
        localStorage.setItem('clients', JSON.stringify(updatedClients));
      }
       return updatedClients;
    });
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients(prevClients => {
      const updatedClients = prevClients.filter(c => c.id !== clientId);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      return updatedClients;
    });
  }, []);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'status'>) => {
    setServers(prevServers => {
        const newServer: Server = {
        ...serverData,
        id: `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`,
        status: 'Online',
        subServers: serverData.subServers || [],
        };
        const updatedServers = [newServer, ...prevServers];
        localStorage.setItem('servers', JSON.stringify(updatedServers));
        return updatedServers;
    });
  }, []);

  const updateServer = useCallback((serverData: Server) => {
    setServers(prevServers => {
      const updatedServers = prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s));
      localStorage.setItem('servers', JSON.stringify(updatedServers));
      return updatedServers;
    });
  }, []);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => {
      const updatedServers = prevServers.filter(s => s.id !== serverId);
      localStorage.setItem('servers', JSON.stringify(updatedServers));
      return updatedServers;
    });
  }, []);

  const addTestToClient = useCallback((clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const newTest: Test = {
      ...testData,
      creationDate: new Date().toISOString(),
    };
    setClients(prev => {
      const updatedClients = prev.map(client => {
        if (client.id === clientId) {
          const newClientData = {
            ...client,
            tests: [...(client.tests || []), newTest]
          };
          return newClientData;
        }
        return client;
      });
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      return updatedClients;
    });
  }, []);

  const value = {
    clients,
    servers,
    addClient,
    updateClient,
    deleteClient,
    addServer,
    updateServer,
    deleteServer,
    addTestToClient,
    saveClientsToStorage,
  };
  
  // Render children only after data is loaded to prevent hydration mismatch
  return <DataContext.Provider value={value}>{isDataLoaded ? children : null}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
