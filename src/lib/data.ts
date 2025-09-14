import type { Client, Server } from './types';
import { subDays, format } from 'date-fns';

export const clients: Client[] = [
  {
    id: 'C001',
    name: 'John Doe',
    nickname: 'Johnny',
    email: 'john.doe@example.com',
    phone: '(11) 98765-4321',
    status: 'Active',
    expiryDate: format(new Date(2025, 5, 15), 'yyyy-MM-dd'),
    birthDate: '1985-08-20',
    registeredDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  },
  {
    id: 'C002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'Active',
    expiryDate: format(new Date(2024, 11, 20), 'yyyy-MM-dd'),
    registeredDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
  },
  {
    id: 'C003',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    status: 'Expired',
    expiryDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    registeredDate: format(subDays(new Date(), 400), 'yyyy-MM-dd'),
  },
  {
    id: 'C004',
    name: 'Mary Williams',
    nickname: 'Mary',
    email: 'mary.williams@example.com',
    phone: '+1 555-1234',
    hasDDI: true,
    status: 'Inactive',
    expiryDate: format(new Date(2025, 1, 1), 'yyyy-MM-dd'),
    birthDate: '1992-02-14',
    registeredDate: format(subDays(new Date(), 120), 'yyyy-MM-dd'),
  },
  {
    id: 'C005',
    name: 'David Brown',
    email: 'david.brown@example.com',
    status: 'Active',
    expiryDate: format(new Date(2026, 0, 5), 'yyyy-MM-dd'),
    registeredDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  },
    {
    id: 'C006',
    name: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    status: 'Active',
    expiryDate: format(new Date(2024, 8, 22), 'yyyy-MM-dd'),
    registeredDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
  },
  {
    id: 'C007',
    name: 'Michael Davis',
    email: 'michael.davis@example.com',
    status: 'Inactive',
    expiryDate: format(new Date(2025, 3, 10), 'yyyy-MM-dd'),
    registeredDate: format(subDays(new Date(), 200), 'yyyy-MM-dd'),
  },
];

export const servers: Server[] = [
  {
    id: 'S01',
    name: 'EU Main Server',
    url: 'eu.main.iptv.com',
    responsibleName: 'Admin',
    paymentType: 'prepaid',
    creditStock: 500,
    subServers: [
        { name: 'Live TV EU', type: 'Live', screens: 1000 },
        { name: 'VOD EU', type: 'VOD', screens: 250 }
    ]
  },
  {
    id: 'S02',
    name: 'US East Server',
    url: 'us.east.iptv.com',
    responsibleName: 'Admin',
    paymentType: 'postpaid',
    panelValue: 'R$ 250,00',
    dueDate: 15,
    creditStock: 120,
    subServers: [
        { name: 'Live TV US', type: 'Live', screens: 830 }
    ]
  },
  {
    id: 'S03',
    name: 'Asia Pacific Server',
    url: 'apac.main.iptv.com',
    responsibleName: 'Admin',
    paymentType: 'prepaid',
    creditStock: 0,
    subServers: []
  },
  {
    id: 'S04',
    name: 'UK Backup Server',
    url: 'uk.backup.iptv.com',
    responsibleName: 'Admin',
    paymentType: 'prepaid',
    creditStock: 85,
    subServers: [
        { name: 'Backup Feed', type: 'Backup', screens: 45 }
    ]
  },
];

    
