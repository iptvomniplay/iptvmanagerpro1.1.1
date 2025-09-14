export type Client = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  hasDDI?: boolean;
  birthDate?: string;
  status: 'Active' | 'Inactive' | 'Expired';
  expiryDate: string;
  registeredDate: string;
};

export type SubServer = {
  name: string;
  type: string;
  screens: number;
};

export type Server = {
  id: string;
  name: string;
  url: string;
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

    