'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test } from '@/lib/types';
import { format } from 'date-fns';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  addClient: (clientData: Omit<Client, 'id' | 'registeredDate'>) => void;
  updateClient: (clientData: Client) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Omit<Server, 'id' | 'status'>) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const safelyParseJSON = (jsonString: string | null, fallback: any) => {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
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
    try {
      const storedClients = localStorage.getItem('clients');
      const storedServers = localStorage.getItem('servers');
      setClients(safelyParseJSON(storedClients, []));
      setServers(safelyParseJSON(storedServers, []));
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setClients([]);
        setServers([]);
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('clients', JSON.stringify(clients));
    }
  }, [clients, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('servers', JSON.stringify(servers));
    }
  }, [servers, isDataLoaded]);


  const addClient = useCallback((clientData: Omit<Client, 'id' | 'registeredDate'>) => {
    setClients(prevClients => {
        const newClient: Client = {
            ...clientData,
            id: `C${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            registeredDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: clientData.birthDate || '',
        };
        return [newClient, ...prevClients];
    });
  }, []);

  const updateClient = useCallback((clientData: Client) => {
    setClients(prevClients =>
      prevClients.map(c => (c.id === clientData.id ? clientData : c))
    );
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== clientId));
  }, []);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'status'>) => {
    setServers(prevServers => {
        const newServer: Server = {
        ...serverData,
        id: `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`,
        status: 'Online',
        subServers: serverData.subServers || [],
        };
        return [newServer, ...prevServers];
    });
  }, []);

  const updateServer = useCallback((serverData: Server) => {
    setServers(prevServers =>
      prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s))
    );
  }, []);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => prevServers.filter(s => s.id !== serverId));
  }, []);

  const addTestToClient = useCallback((clientId: string, testData: Omit<Test, 'creationDate'>) => {
    const newTest: Test = {
      ...testData,
      creationDate: new Date().toISOString(),
    };
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          tests: [...(client.tests || []), newTest]
        }
      }
      return client;
    }));
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
  };
  
  // Render children only after data is loaded from localStorage to prevent hydration mismatch
  return <DataContext.Provider value={value}>{isDataLoaded ? children : null}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
