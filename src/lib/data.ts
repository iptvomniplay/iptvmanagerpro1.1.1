import type { Client, Server } from './types';

export const clients: Client[] = [
  {
    _tempId: 'client_1',
    id: 'CLI001',
    name: 'Cliente Exemplo Salvo no Código',
    nickname: 'Exemplo',
    email: 'exemplo@codigo.com',
    phones: [{ type: 'celular', number: '(99) 99999-9999' }],
    status: 'Active',
    registeredDate: '2023-10-27',
    dueDate: 15,
    observations: 'Este cliente foi adicionado diretamente no arquivo data.ts.',
    plans: [],
    applications: [],
    tests: []
  }
];

export const servers: Server[] = [
  {
    id: 'server_1',
    name: 'Servidor Exemplo Salvo no Código',
    url: 'codigo.exemplo.com',
    login: 'admin_codigo',
    status: 'Online',
    responsibleName: 'O Mestre',
    paymentType: 'prepaid',
    creditStock: 50,
    observations: 'Este servidor foi adicionado diretamente no arquivo data.ts.'
  }
];
