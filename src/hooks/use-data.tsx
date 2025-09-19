'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan } from '@/lib/types';
import { format } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';

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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [servers, setServers] = useState<Server[]>(initialServers);

  // This function is now a no-op but kept for compatibility to avoid breaking components.
  const saveClientsToStorage = useCallback(() => {
    // console.log("Operação de salvar no localStorage desativada.");
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'registeredDate' | 'plans' | 'id'>) => {
    setClients(prevClients => {
        const newClient: Client = {
            ...(clientData as Client),
            id: clientData.id || '', // ID will be set manually by the user
            _tempId: `temp_${Date.now()}`,
            registeredDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: clientData.birthDate || '',
            plans: [],
        };
        return [newClient, ...prevClients];
    });
  }, []);

  const updateClient = useCallback((clientData: Client, skipSave = false) => {
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c.id && c.id === clientData.id && c.id !== '') || (c._tempId && c._tempId === clientData._tempId)
          ? { ...c, ...clientData } 
          : c
      );
       return updatedClients;
    });
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== clientId && c._tempId !== clientId));
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
    setServers(prevServers => prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s)));
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
          return { ...client, tests: [...(client.tests || []), newTest] };
        }
        return client;
      })
    );
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
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
