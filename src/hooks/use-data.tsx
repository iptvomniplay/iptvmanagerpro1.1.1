'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan } from '@/lib/types';
import { format } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';
import { useToast } from './use-toast';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | 'id' | '_tempId'>) => void;
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
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const { toast } = useToast();
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (toastShown) return;

    try {
      const storedClients = localStorage.getItem('clients');
      if (storedClients && storedClients !== '[]') {
        toast({
            title: "Verificação do Navegador",
            description: "Mestre, verifiquei e SIM, existem dados de clientes salvos no localStorage do seu navegador."
        });
        setClients(JSON.parse(storedClients));
      } else {
        toast({
            title: "Verificação do Navegador",
            description: "Mestre, verifiquei e NÃO, não há dados de clientes salvos no localStorage do seu navegador. O sistema está limpo."
        });
        const clientsWithTempId = initialClients.map(c => ({...c, _tempId: `temp_${Date.now()}_${Math.random()}`}));
        setClients(clientsWithTempId);
        if(clientsWithTempId.length > 0) {
          localStorage.setItem('clients', JSON.stringify(clientsWithTempId));
        }
      }
    } catch (error) {
      console.error('Failed to load clients from localStorage', error);
      const clientsWithTempId = initialClients.map(c => ({...c, _tempId: `temp_${Date.now()}_${Math.random()}`}));
      setClients(clientsWithTempId);
    }
    setToastShown(true);
  }, [toast, toastShown]);
  
  useEffect(() => {
    // Apenas para dados de servidor, que não são persistidos.
    setServers(initialServers);
  }, []);


  const saveClientsToStorage = useCallback((updatedClients: Client[]) => {
    try {
      localStorage.setItem('clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error('Failed to save clients to localStorage', error);
    }
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'registeredDate' | 'plans' | 'id' | '_tempId'>) => {
    setClients(prevClients => {
        const newClient: Client = {
            ...(clientData as Client),
            _tempId: `temp_${Date.now()}_${Math.random()}`,
            id: '',
            registeredDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: clientData.birthDate || '',
            plans: [],
        };
        const updatedClients = [newClient, ...prevClients];
        saveClientsToStorage(updatedClients);
        return updatedClients;
    });
  }, [saveClientsToStorage]);

  const updateClient = useCallback((clientData: Client, skipSave = false) => {
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c._tempId && c._tempId === clientData._tempId) || (c.id && c.id === clientData.id)
          ? { ...c, ...clientData } 
          : c
      );
      if (!skipSave) {
        saveClientsToStorage(updatedClients);
      }
       return updatedClients;
    });
  }, [saveClientsToStorage]);

  const deleteClient = useCallback((tempId: string) => {
    setClients(prevClients => {
      const updatedClients = prevClients.filter(c => c._tempId !== tempId);
      saveClientsToStorage(updatedClients);
      return updatedClients;
    });
  }, [saveClientsToStorage]);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'status'>) => {
    setServers(prevServers => {
        const newServer: Server = {
        ...serverData,
        id: `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`,
        status: 'Online',
        subServers: serverData.subServers || [],
        };
        const updatedServers = [newServer, ...prevServers];
        // NOTE: Servers are not persisted to localStorage in this implementation
        return updatedServers;
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
    setClients(prev => {
        const updatedClients = prev.map(client => {
            if (client.id === clientId || client._tempId === clientId) {
              return { ...client, tests: [...(client.tests || []), newTest] };
            }
            return client;
        });
        saveClientsToStorage(updatedClients);
        return updatedClients;
      }
    );
  }, [saveClientsToStorage]);

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
    saveClientsToStorage: () => saveClientsToStorage(clients),
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
