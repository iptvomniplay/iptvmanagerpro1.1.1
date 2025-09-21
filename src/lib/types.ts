'use client';

export type Phone = {
  type: 'celular' | 'fixo' | 'ddi';
  number: string;
};

export type Test = {
  clientId: string;
  panelId: string;
  subServerName: string;
  package: string;
  durationValue: number;
  durationUnit: 'hours' | 'days';
  creationDate: string;
};

export type Application = {
  name: string;
  isPreExisting: boolean;
  macAddress: string;
  keyId: string;
  licenseType: 'Free' | 'Anual';
  licenseDueDate?: string;
  device: string;
  location: string;
  activationLocation?: string;
  hasResponsible?: boolean;
  responsibleName?: string;
  responsiblePhones?: Phone[];
  activationId?: string;
  activationNotes?: string;
  planId: string;
  screenNumber: number;
  status?: 'Active' | 'Expired';
};

export type PlanPeriod = '30d' | '3m' | '6m' | '1y';

export type PlanStatus = 'Active' | 'Pending' | 'Expired' | 'Blocked';

export type SelectedPlan = {
  panel: Server;
  server: SubServer;
  plan: PlanType;
  screens: number;
  planValue: number;
  isCourtesy: boolean;
  planPeriod: PlanPeriod;
  dueDate?: number;
  status?: PlanStatus;
  observations?: string;
};


export type Client = {
  id: string; // ID manual, pode ser string vazia inicialmente
  _tempId: string; // ID interno e único para o React
  name: string;
  nickname?: string;
  email: string;
  phones: Phone[];
  status: 'Active' | 'Inactive' | 'Expired' | 'Test';
  registeredDate: string;
  activationDate?: string;
  expirationDate?: string;
  tests?: Test[];
  applications?: Application[];
  birthDate?: string;
  observations?: string;
  plans?: SelectedPlan[];
};

export type PlanType = {
  name: string;
  value?: number;
};

export type SubServer = {
  name: string;
  type: string;
  screens: number;
  plans: PlanType[];
  status: 'Online' | 'Offline' | 'Suspended' | 'Maintenance';
};

export type TransactionType = 'purchase' | 'consumption' | 'reversal' | 'adjustment';

export type Transaction = {
  id: string;
  type: TransactionType;
  date: string;
  credits: number; // Pode ser negativo para estornos e consumos
  totalValue: number; // Pode ser negativo para estornos
  unitValue: number;
  description?: string;
};

export type Server = {
  id: string;
  name: string;
  url: string;
  login: string;
  password?: string;
  status: 'Online' | 'Offline' | 'Suspended' | 'Maintenance';
  responsibleName: string;
  nickname?: string;
  phones?: Phone[];
  paymentType: 'prepaid' | 'postpaid';
  panelValue?: number;
  dueDate?: number;
  creditStock: number;
  subServers?: SubServer[];
  observations?: string;
  transactions?: Transaction[];
};

export type Note = {
  id: string;
  content: string;
  color: string;
};

export type CashFlowEntry = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  clientId?: string; // Opcional, para vincular a um cliente
  clientName?: string; // Opcional, para exibição
  sourceTransactionId?: string; // Vincula a uma transação de estoque
  sourceServerId?: string; // Vincula a um servidor (para custos de painel)
};