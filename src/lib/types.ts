export type Client = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  hasDDI?: boolean;
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
  phone?: string;
  hasDDI?: boolean;
  paymentType: 'prepaid' | 'postpaid';
  panelValue?: string;
  dueDate?: number;
  creditStock?: number;
  subServers?: SubServer[];
};
