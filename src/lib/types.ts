export type Phone = {
  type: 'celular' | 'fixo' | 'ddi';
  number: string;
};

export type Client = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phones: Phone[];
  birthDate: string;
  status: 'Active' | 'Inactive' | 'Expired' | 'Test';
  registeredDate: string;
};

export type SubServer = {
  name: string;
  type: string;
  screens: number;
  plans: string[];
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
};
