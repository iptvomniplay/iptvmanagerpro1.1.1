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
}

export type Client = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phones: Phone[];
  status: 'Active' | 'Inactive' | 'Expired' | 'Test';
  registeredDate: string;
  expirationDate?: string;
  tests?: Test[];
  observations?: string;
};

export type Plan = {
  name: string;
  value: number;
}

export type SubServer = {
  name: string;
  type: string;
  screens: number;
  plans: Plan[];
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
