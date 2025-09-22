'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Client, Server, Test, SelectedPlan, Transaction, TransactionType, CashFlowEntry, Note } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { clients as initialClients, servers as initialServers } from '@/lib/data';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';

interface DataContextType {
  clients: Client[];
  servers: Server[];
  cashFlow: CashFlowEntry[];
  notes: Note[];
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
  updateCashFlowEntry: (entry: CashFlowEntry) => void;
  deleteCashFlowEntry: (entryId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('clients');
      const loadedClients = storedClients ? JSON.parse(storedClients) : initialClients.map(c => ({...c, _tempId: c._tempId || `temp_${Date.now()}_${Math.random()}`}));
      setClients(loadedClients);

      const storedServers = localStorage.getItem('servers');
      let loadedServers: Server[] = storedServers ? JSON.parse(storedServers) : initialServers;
      
      const storedCashFlow = localStorage.getItem('cashFlow');
      let loadedCashFlow: CashFlowEntry[] = storedCashFlow ? JSON.parse(storedCashFlow) : [];

      const storedNotes = localStorage.getItem('notes');
      const loadedNotes = storedNotes ? JSON.parse(storedNotes) : [];
      setNotes(loadedNotes);

      const newCashFlowEntries: CashFlowEntry[] = [];

      loadedServers = loadedServers.map(server => {
        if (server.creditStock < 0) {
            server.creditStock = 0;
        }
        let serverTransactions = server.transactions || [];
        if (server.paymentType === 'prepaid' && server.creditStock > 0 && serverTransactions.length === 0) {
            const initialPurchase: Transaction = {
                id: `trans_${Date.now()}_${Math.random()}`,
                type: 'purchase',
                date: new Date().toISOString(),
                credits: server.creditStock,
                totalValue: 0, 
                unitValue: 0,
                description: 'Carga inicial de créditos (Valor desconhecido)'
            };
            serverTransactions = [initialPurchase];
        }

        serverTransactions.forEach(transaction => {
            if (transaction.type === 'purchase' && transaction.totalValue > 0) {
                const hasEntry = loadedCashFlow.some(entry => entry.sourceTransactionId === transaction.id);
                if (!hasEntry) {
                    newCashFlowEntries.push({
                        id: `cf_${Date.now()}_${Math.random()}`,
                        date: transaction.date,
                        type: 'expense',
                        amount: transaction.totalValue,
                        description: `Compra de créditos: ${server.name}`,
                        sourceTransactionId: transaction.id
                    });
                }
            }
        });
        
        if (server.paymentType === 'postpaid' && server.panelValue && server.panelValue > 0) {
          const hasEntry = loadedCashFlow.some(entry => entry.sourceServerId === server.id && entry.description.includes('Pagamento do painel'));
          if(!hasEntry) {
             newCashFlowEntries.push({
                id: `cf_${Date.now()}_${Math.random()}`,
                date: new Date().toISOString(),
                type: 'expense',
                amount: server.panelValue,
                description: `Pagamento do painel: ${server.name}`,
                sourceServerId: server.id
            });
          }
        }

        return {
            ...server,
            transactions: serverTransactions
        };
      });
      setServers(loadedServers);

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
      setNotes([]);
    } finally {
        setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('servers', JSON.stringify(servers));
      localStorage.setItem('cashFlow', JSON.stringify(cashFlow));
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [clients, servers, cashFlow, notes, isDataLoaded]);
  
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
  
  const updateCashFlowEntry = useCallback((entryData: CashFlowEntry) => {
    setCashFlow(prevCashFlow => {
        const updatedCashFlow = prevCashFlow.map(entry =>
            entry.id === entryData.id ? { ...entry, ...entryData } : entry
        );
        return updatedCashFlow;
    });
  }, []);

  const deleteCashFlowEntry = useCallback((entryId: string) => {
      setCashFlow(prevCashFlow => {
          const updatedCashFlow = prevCashFlow.filter(entry => entry.id !== entryId);
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
    const newServerId = `S${(Math.random() * 100).toFixed(0).padStart(2, '0')}`;
    setServers(prevServers => {
        const newServer: Server = {
        ...serverData,
        id: newServerId,
        status: 'Online',
        subServers: serverData.subServers || [],
        transactions: [],
        };
        const updatedServers = [newServer, ...prevServers];
        return updatedServers;
    });
    
    if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
      addCashFlowEntry({
        type: 'expense',
        amount: serverData.panelValue,
        description: `Pagamento do painel: ${serverData.name}`,
        sourceServerId: newServerId
      });
    }

  }, [addCashFlowEntry]);

  const updateServer = useCallback((serverData: Server) => {
    const oldServer = servers.find(s => s.id === serverData.id);
    
    setServers(prevServers => {
      const updatedServers = prevServers.map(s => (s.id === serverData.id ? {...s, ...serverData} : s));
      return updatedServers;
    });
    
    if (serverData.paymentType === 'postpaid' && serverData.panelValue && serverData.panelValue > 0) {
      if (!oldServer || oldServer.panelValue !== serverData.panelValue) {
        setCashFlow(prev => {
          const newFlow = prev.filter(entry => !(entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel')));
          const newEntry: CashFlowEntry = {
            id: `cf_${Date.now()}_${Math.random()}`,
            date: new Date().toISOString(),
            type: 'expense',
            amount: serverData.panelValue!,
            description: `Pagamento do painel: ${serverData.name}`,
            sourceServerId: serverData.id
          };
          return [newEntry, ...newFlow];
        });
      }
    } else if (serverData.paymentType !== 'postpaid') {
      setCashFlow(prev => prev.filter(entry => !(entry.sourceServerId === serverData.id && entry.description.includes('Pagamento do painel'))));
    }

  }, [servers]);

  const deleteServer = useCallback((serverId: string) => {
    const clientsUsingServer = clients.filter(client => 
        client.plans?.some(plan => plan.panel.id === serverId)
    );

    if (clientsUsingServer.length > 0) {
        toast({
            title: t('success'),
            description: t('deleteServerWarningDescription', { count: clientsUsingServer.length }),
        });
    }

    setServers(prevServers => {
      const updatedServers = prevServers.filter(s => s.id !== serverId);
      return updatedServers;
    });
  }, [clients, t, toast]);

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
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const serverName = server.name;
    const currentStock = server.creditStock;
    const finalQuantity = transactionData.type === 'adjustment' ? transactionData.credits : transactionData.credits;

    if (currentStock + finalQuantity < 0) {
      toast({
          variant: "destructive",
          title: t('validationError'),
          description: t('negativeStockError'),
      });
      return;
    }

    const newTransactionId = `trans_${Date.now()}_${Math.random()}`;

    setServers(prevServers => {
      const updatedServers = prevServers.map(s => {
        if (s.id === serverId) {
          const newTransaction: Transaction = {
            ...transactionData,
            credits: finalQuantity,
            id: newTransactionId,
            date: new Date().toISOString(),
          };
          
          let updatedTransactions = [newTransaction, ...(s.transactions || [])];
          
          const newCreditStock = s.creditStock + newTransaction.credits;

          return { ...s, transactions: updatedTransactions, creditStock: newCreditStock };
        }
        return s;
      });
      return updatedServers;
    });

    if (transactionData.type === 'purchase' && transactionData.totalValue > 0) {
        addCashFlowEntry({
            type: 'expense',
            amount: transactionData.totalValue,
            description: `Compra de créditos: ${serverName}`,
            sourceTransactionId: newTransactionId,
        });
    } else if (transactionData.type === 'reversal' && transactionData.totalValue !== 0) {
      addCashFlowEntry({
        type: 'income',
        amount: Math.abs(transactionData.totalValue),
        description: `Estorno da compra de créditos: ${serverName}`,
        sourceTransactionId: newTransactionId,
      });
    }
  }, [addCashFlowEntry, servers, t, toast]);

  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((noteData: Note) => {
    setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  const value = {
    clients,
    servers,
    cashFlow,
    notes,
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
    updateCashFlowEntry,
    deleteCashFlowEntry,
    addNote,
    updateNote,
    deleteNote,
    setNotes,
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
