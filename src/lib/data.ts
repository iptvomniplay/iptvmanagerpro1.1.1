import type { Client, Server } from './types';

export const clients: Client[] = [];

export const servers: Server[] = [
  {
    id: 'SRV01',
    name: 'Painel Principal America',
    url: 'painel-principal.example.com',
    login: 'admin_america',
    responsibleName: 'Admin',
    status: 'Online',
    paymentType: 'postpaid',
    panelValue: 'R$ 500,00',
    dueDate: 10,
    creditStock: 0,
    subServers: [
      {
        name: 'Servidor Live BR',
        type: 'Live',
        screens: 500,
        plans: [
          { name: 'Plano Bronze', value: 30 },
          { name: 'Plano Prata', value: 40 },
          { name: 'Plano Ouro', value: 50 },
        ],
        status: 'Online',
      },
      {
        name: 'Servidor VOD BR',
        type: 'VOD',
        screens: 1000,
        plans: [{ name: 'Plano VOD', value: 25 }],
        status: 'Online',
      },
    ],
  },
  {
    id: 'SRV02',
    name: 'Painel Secundário Europa',
    url: 'painel-europa.example.com',
    login: 'admin_europa',
    responsibleName: 'Admin EU',
    status: 'Maintenance',
    paymentType: 'prepaid',
    creditStock: 150,
    subServers: [
      {
        name: 'Servidor Live EU',
        type: 'Live',
        screens: 300,
        plans: [{ name: 'Plano Europeu', value: 35 }],
        status: 'Maintenance',
      },
    ],
    observations: 'Manutenção programada para o fim de semana.',
  },
];
