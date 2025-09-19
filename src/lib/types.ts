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
};

export type PlanPeriod = '30d' | '3m' | '6m' | '1y';

export type SelectedPlan = {
  panel: Server;
  server: SubServer;
  plan: PlanType;
  screens: number;
  planValue: number;
  isCourtesy: boolean;
  planPeriod: PlanPeriod;
  dueDate?: number;
};


export type Client = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phones: Phone[];
  status: 'Active' | 'Inactive' | 'Expired' | 'Test';
  registeredDate: string;
  expirationDate?: string;
  dueDate?: number;
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
  panelValue?: string;
  dueDate?: number;
  creditStock: number;
  subServers?: SubServer[];
  observations?: string;
};
