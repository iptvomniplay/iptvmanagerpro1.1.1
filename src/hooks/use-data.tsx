'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan } from '@/lib/types';
import { format } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';
import { useToast } from './use-toast';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => void;
  updateClient: (clientData: Client, skipSave?: boolean) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Omit<Server, 'id' | 'status'>) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load clients
    try {
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
          setClients(JSON.parse(storedClients));
      } else {
        const clientsWithTempId = initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
        setClients(clientsWithTempId);
      }
    } catch (error) {
      console.error('Failed to load clients from localStorage', error);
      const clientsWithTempId = initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
      setClients(clientsWithTempId);
    }

    // Load servers
    try {
      const storedServers = localStorage.getItem('servers');
      if (storedServers) {
        setServers(JSON.parse(storedServers));
      } else {
        setServers(initialServers);
      }
    } catch (error) {
      console.error('Failed to load servers from localStorage', error);
      setServers(initialServers);
    }
    
    setIsLoaded(true);
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

  const updateClient = useCallback((clientData: Client, skipSave = false) => {
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c._tempId && c._tempId === clientData._tempId) || (c.id && c.id === clientData.id)
          ? { ...c, ...clientData } 
          : c
      );
      if (!skipSave) {
        saveDataToStorage('clients', updatedClients);
      }
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
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
