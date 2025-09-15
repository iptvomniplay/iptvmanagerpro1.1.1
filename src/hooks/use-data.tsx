'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server } from '@/lib/types';
import { clients as initialClients, servers as initialServers } from '@/lib/data';
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('clients');
      const storedServers = localStorage.getItem('servers');

      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(initialClients);
        localStorage.setItem('clients', JSON.stringify(initialClients));
      }

      if (storedServers) {
        setServers(JSON.parse(storedServers));
      } else {
        setServers(initialServers);
        localStorage.setItem('servers', JSON.stringify(initialServers));
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setClients(initialClients);
        setServers(initialServers);
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

  const value = {
    clients,
    servers,
    addClient,
    updateClient,
    deleteClient,
    addServer,
    updateServer,
    deleteServer,
  };

  return <DataContext.Provider value={value}>{isDataLoaded ? children : null}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
