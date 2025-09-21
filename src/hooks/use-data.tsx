'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan, Transaction, TransactionType, CashFlowEntry } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  cashFlow: CashFlowEntry[];
  isDataLoaded: boolean;
  addClient: (clientData: Omit<Client, 'registeredDate' | 'plans' | '_tempId'>) => void;
  updateClient: (clientData: Client, options?: { skipCashFlow?: boolean }) => void;
  deleteClient: (clientId: string) => void;
  addServer: (serverData: Omit<Server, 'id' | 'status'>) => void;
  updateServer: (serverData: Server) => void;
  deleteServer: (serverId: string) => void;
  addTestToClient: (clientId: string, testData: Omit<Test, 'creationDate'>) => void;
  updateTestInClient: (clientId: string, testCreationDate: string, updatedTest: Partial<Test>) => void;
  addTransactionToServer: (serverId: string, transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id' | 'date'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('clients');
      const loadedClients = storedClients ? JSON.parse(storedClients) : initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
      setClients(loadedClients);

      const storedServers = localStorage.getItem('servers');
      let loadedServers: Server[] = storedServers ? JSON.parse(storedServers) : initialServers;
      
      const storedCashFlow = localStorage.getItem('cashFlow');
      let loadedCashFlow: CashFlowEntry[] = storedCashFlow ? JSON.parse(storedCashFlow) : [];

      // Retroactively create initial purchase transactions for servers
      loadedServers = loadedServers.map(server => {
        if (server.paymentType === 'prepaid' && server.creditStock > 0 && (!server.transactions || server.transactions.length === 0)) {
            const initialPurchase: Transaction = {
                id: `trans_${Date.now()}_${Math.random()}`,
                type: 'purchase',
                date: new Date().toISOString(), // Assume the purchase happened "now" for retro-compatibility
                credits: server.creditStock,
                totalValue: 0, // We don't know the value, so we assume it was a bonus or initial setup
                unitValue: 0,
                description: 'Carga inicial de créditos'
            };
            return {
                ...server,
                transactions: [initialPurchase]
            };
        }
        return server;
      });
      setServers(loadedServers);


      // Retroactively create cash flow entries for existing active clients
      const newCashFlowEntries: CashFlowEntry[] = [];
      loadedClients.forEach((client: Client) => {
        if (client.status === 'Active' && client.plans && client.plans.length > 0) {
          const alreadyHasEntry = loadedCashFlow.some((entry: CashFlowEntry) => 
            entry.clientId === client._tempId && entry.description?.includes('Assinatura inicial')
          );

          if (!alreadyHasEntry) {
            const totalAmount = client.plans.reduce((sum, plan) => sum + (plan.isCourtesy ? 0 : plan.planValue), 0);
            if (totalAmount > 0) {
              const incomeEntry: CashFlowEntry = {
                id: `cf_${Date.now()}_${Math.random()}`,
                date: client.activationDate || client.registeredDate,
                type: 'income',
                amount: totalAmount,
                description: `Assinatura inicial - ${client.name}`,
                clientId: client._tempId,
                clientName: client.name,
              };
              newCashFlowEntries.push(incomeEntry);
            }
          }
        }
      });
      
      if (newCashFlowEntries.length > 0) {
        loadedCashFlow = [...newCashFlowEntries, ...loadedCashFlow];
      }

      setCashFlow(loadedCashFlow);

    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      const clientsWithTempId = initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
      setClients(clientsWithTempId);
      setServers(initialServers);
      setCashFlow([]);
    } finally {
        setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('servers', JSON.stringify(servers));
      localStorage.setItem('cashFlow', JSON.stringify(cashFlow));
    }
  }, [clients, servers, cashFlow, isDataLoaded]);

  const saveDataToStorage = useCallback(<T,>(key: string, data: T[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, []);
  
  const addCashFlowEntry = useCallback((entryData: Omit<CashFlowEntry, 'id' | 'date'>) => {
    setCashFlow(prevCashFlow => {
      const newEntry: CashFlowEntry = {
        ...entryData,
        id: `cf_${Date.now()}_${Math.random()}`,
        date: new Date().toISOString(),
      };
      const updatedCashFlow = [newEntry, ...prevCashFlow];
      return updatedCashFlow;
    });
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
        return updatedClients;
    });
  }, []);

  const updateClient = useCallback((clientData: Client, options?: { skipCashFlow?: boolean }) => {
    // Check for new activation to add to cash flow
    const previousClientState = clients.find(c => c._tempId === clientData._tempId);
    if (!options?.skipCashFlow && clientData.status === 'Active' && previousClientState?.status !== 'Active' && clientData.plans) {
        const totalAmount = clientData.plans.reduce((sum, plan) => sum + (plan.isCourtesy ? 0 : plan.planValue), 0);
        if (totalAmount > 0) {
            addCashFlowEntry({
                type: 'income',
                amount: totalAmount,
                description: `Assinatura inicial - ${clientData.name}`,
                clientId: clientData._tempId,
                clientName: clientData.name,
            });
        }
        
        // Create consumption transaction
        setServers(prevServers => {
            const updatedServers = [...prevServers];
            let cashFlowEntries: Omit<CashFlowEntry, 'id' | 'date'>[] = [];

            clientData.plans?.forEach(plan => {
                const serverIndex = updatedServers.findIndex(s => s.id === plan.panel.id);
                if (serverIndex !== -1) {
                    const server = updatedServers[serverIndex];
                    const creditsToConsume = 1; 

                    const purchaseTransactions = (server.transactions || [])
                        .filter(t => t.type === 'purchase')
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                    let costOfConsumption = 0;
                    if (purchaseTransactions.length > 0) {
                        costOfConsumption = creditsToConsume * purchaseTransactions[0].unitValue;
                    }

                    const consumptionTransaction: Omit<Transaction, 'id' | 'date'> = {
                        type: 'consumption',
                        credits: -creditsToConsume,
                        description: `Consumo para cliente ${clientData.name} (${plan.plan.name})`,
                        totalValue: -costOfConsumption,
                        unitValue: costOfConsumption,
                    };
                    
                    const newTransaction: Transaction = {
                        ...consumptionTransaction,
                        id: `trans_${Date.now()}_${Math.random()}`,
                        date: new Date().toISOString(),
                    };

                    const updatedTransactions = [newTransaction, ...(server.transactions || [])];
                    const newCreditStock = updatedTransactions.reduce((acc, trans) => acc + trans.credits, 0);

                    updatedServers[serverIndex] = { ...server, transactions: updatedTransactions, creditStock: newCreditStock };

                     if (costOfConsumption > 0) {
                        cashFlowEntries.push({
                            type: 'expense',
                            amount: costOfConsumption,
                            description: `Custo do crédito: ${clientData.name} (${plan.plan.name})`,
                            clientId: clientData._tempId,
                            clientName: clientData.name,
                            sourceTransactionId: newTransaction.id,
                        });
                    }
                }
            });
            
            if (cashFlowEntries.length > 0) {
                setCashFlow(prevCashFlow => {
                    const newEntries = cashFlowEntries.map(entry => ({
                        ...entry,
                        id: `cf_${Date.now()}_${Math.random()}`,
                        date: new Date().toISOString(),
                    }));
                    const updatedCashFlow = [...newEntries, ...prevCashFlow];
                    return updatedCashFlow;
                });
            }
            return updatedServers;
        });
    }
    
    setClients(prevClients => {
       const updatedClients = prevClients.map(c => 
        (c._tempId === clientData._tempId) ? { ...c, ...clientData } : c
      );
       return updatedClients;
    });
  }, [clients, addCashFlowEntry]);

  const deleteClient = useCallback((tempId: string) => {
    setClients(prevClients => {
      const updatedClients = prevClients.filter(c => c._tempId !== tempId);
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
        transactions: [],
        };
        const updatedServers = [newServer, ...prevServers];
        return updatedServers;
    });
  }, []);

  const updateServer = useCallback((serverData: Server) => {
    setServers(prevServers => {
      const updatedServers = prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s));
      return updatedServers;
    });
  }, []);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => {
      const updatedServers = prevServers.filter(s => s.id !== serverId);
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
            if (client.id === clientId || client._tempId === clientId) {
              return { ...client, tests: [...(client.tests || []), newTest] };
            }
            return client;
        });
        return updatedClients;
      }
    );
  }, []);

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
      return updatedClients;
    });
  }, []);

  const addTransactionToServer = useCallback((serverId: string, transactionData: Omit<Transaction, 'id' | 'date'>) => {
    let serverName = '';
    setServers(prevServers => {
      const updatedServers = prevServers.map(server => {
        if (server.id === serverId) {
          serverName = server.name;
          const newTransaction: Transaction = {
            ...transactionData,
            id: `trans_${Date.now()}_${Math.random()}`,
            date: new Date().toISOString(),
          };
          const updatedTransactions = [newTransaction, ...(server.transactions || [])];
          const newCreditStock = updatedTransactions.reduce((acc, trans) => acc + trans.credits, 0);

          return { ...server, transactions: updatedTransactions, creditStock: newCreditStock };
        }
        return server;
      });
      return updatedServers;
    });

    if (transactionData.type === 'purchase' && transactionData.totalValue > 0) {
        addCashFlowEntry({
            type: 'expense',
            amount: transactionData.totalValue,
            description: `Compra de créditos para o painel ${serverName}`,
        });
    }
  }, [addCashFlowEntry]);

  const value = {
    clients,
    servers,
    cashFlow,
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
