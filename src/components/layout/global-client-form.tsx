'use client';

import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClientForm } from '@/app/clients/components/client-form';

export default function GlobalClientForm() {
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
