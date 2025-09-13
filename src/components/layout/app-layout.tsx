import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import Header from './header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClientForm } from '@/app/clients/components/client-form';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';


function GlobalClientForm() {
  const { 
    isClientFormOpen, 
    closeClientForm, 
    editingClient, 
    handleClientFormSubmit 
  } = useData();
  const { t } = useLanguage();

  return (
    <Dialog open={isClientFormOpen} onOpenChange={(isOpen) => {
      if (!isOpen) {
        closeClientForm();
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingClient ? t('editClient') : t('registerNewClient')}
          </DialogTitle>
          <DialogDescription>
            {editingClient ? t('editClientDescription') : t('registerNewClientDescription')}
          </DialogDescription>
        </DialogHeader>
        <ClientForm
            client={editingClient}
            onSubmit={handleClientFormSubmit}
            onCancel={closeClientForm}
        />
      </DialogContent>
    </Dialog>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-background">{children}</main>
      </SidebarInset>
       <GlobalClientForm />
    </SidebarProvider>
  );
}
