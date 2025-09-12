import { clients } from '@/lib/data';
import ClientsPageContent from './components/clients-page-content';

export default function ClientsPage() {
  // In a real app, you'd fetch this data from an API or database.
  const clientsData = clients;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
        <p className="text-muted-foreground">
          View, add, edit, and manage your clients.
        </p>
      </div>
      <ClientsPageContent initialClients={clientsData} />
    </div>
  );
}
