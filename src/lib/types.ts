export type Client = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Expired';
  expiryDate: string;
  registeredDate: string;
};

export type Server = {
  id: string;
  name: string;
  url: string;
  status: 'Online' | 'Offline';
  connections: number;
  maxConnections: number;
  cpuLoad: number;
  responsibleName: string;
  nickname?: string;
  phone?: string;
  paymentType: 'prepaid' | 'postpaid';
  panelValue?: string;
  dueDate?: number;
  creditStock?: number;
};
