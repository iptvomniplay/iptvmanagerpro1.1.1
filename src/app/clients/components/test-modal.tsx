'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client, Server } from '@/lib/types';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, User, Server as ServerIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { normalizeString } from '@/lib/utils';
import { PanelSelectionModal } from './panel-selection-modal';

const testFormSchema = (t: (key: string) => string) => z.object({
  duration: z.coerce.number().min(1, { message: 'Duration is required.' }),
  package: z.string().min(1, { message: 'Package is required.' }),
});

type TestFormValues = z.infer<ReturnType<typeof testFormSchema>>;

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestModal({ isOpen, onClose }: TestModalProps) {
  const { t } = useLanguage();
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isPanelModalOpen, setIsPanelModalOpen] = React.useState(false);
  const [selectedPanel, setSelectedPanel] = React.useState<Server | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema(t)),
    defaultValues: {
      duration: 24,
      package: 'all_channels',
    },
  });

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const normalizedTerm = normalizeString(searchTerm);

    const results = clients.filter((client) => {
        const normalizedName = normalizeString(client.name);
        const normalizedNickname = client.nickname ? normalizeString(client.nickname) : '';
        const clientPhoneNumeric = client.phone ? normalizeString(client.phone).replace(/\D/g, '') : '';
        const searchPhoneNumeric = normalizedTerm.replace(/\D/g, '');

        return (
            normalizedName.includes(normalizedTerm) ||
            (normalizedNickname && normalizedNickname.includes(normalizedTerm)) ||
            (searchPhoneNumeric.length > 0 && clientPhoneNumeric.includes(searchPhoneNumeric))
        );
    });
    setSearchResults(results);
  }, [searchTerm, clients]);
  
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSelectPanel = (panel: Server) => {
    setSelectedPanel(panel);
    setIsPanelModalOpen(false);
  };

  const handleSubmit = (values: TestFormValues) => {
    console.log('Test data:', { ...values, clientId: selectedClient?.id, panelId: selectedPanel?.id });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setSelectedClient(null);
        setSelectedPanel(null);
        setSearchTerm('');
        setSearchResults([]);
        form.reset();
    }, 300)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="h-screen w-screen max-w-none flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">{t('addTestToClient')}</DialogTitle>
            <DialogDescription>{t('addTestToClientDescription')}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 h-full grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{t('searchClient')}</h3>
                  <p className="text-muted-foreground">{t('selectClientPrompt')}</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t('searchClientPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <ScrollArea className="h-72 rounded-md border">
                    <div className="p-4 space-y-2">
                      {searchResults.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => handleSelectClient(client)}
                        >
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          </div>
                          <Button variant="outline" size="sm">{t('selectClient')}</Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {!selectedClient && searchResults.length === 0 && (
                   <div className="flex items-center justify-center h-full text-muted-foreground text-center rounded-lg border border-dashed py-10">
                      <p>{searchTerm ? t('noClientFound') : t('awaitingInput')}</p>
                  </div>
                )}

                {selectedClient && (
                    <div className="space-y-2">
                        <Label htmlFor="selected-client-name">{t('client')}</Label>
                        <div className="flex items-center gap-3 rounded-lg border p-4 bg-accent">
                            <User className="h-6 w-6 text-muted-foreground"/>
                            <Input
                                id="selected-client-name"
                                value={selectedClient.name}
                                readOnly
                                className="bg-transparent border-0 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>
                )}
              </div>
              
              <div className="space-y-6">
                  {selectedClient && (
                       <div className="space-y-6">
                        <Form {...form}>
                          <form id="test-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                              <h3 className="text-xl font-semibold">{t('testDetails')}</h3>
                              
                              <div className="space-y-2">
                                <Label>{t('panel')}</Label>
                                <div className="relative">
                                  <Input
                                    placeholder={t('selectPanelPlaceholder')}
                                    value={selectedPanel ? selectedPanel.name : ''}
                                    readOnly
                                    onClick={() => setIsPanelModalOpen(true)}
                                    className="cursor-pointer"
                                  />
                                   <ServerIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                              </div>

                              {selectedPanel && (
                                <div className="space-y-4">
                                  <h4 className="font-semibold">{t('subServerDetails')}</h4>
                                  {selectedPanel.subServers && selectedPanel.subServers.length > 0 ? (
                                     <ul className="grid gap-2">
                                        {selectedPanel.subServers.map((sub, index) => (
                                          <li key={index} className="flex justify-between items-center rounded-md border p-3">
                                            <p>{sub.name} ({sub.type})</p>
                                            <p className="text-muted-foreground">{t('screens')}: {sub.screens}</p>
                                          </li>
                                        ))}
                                      </ul>
                                  ) : (
                                    <p className="text-muted-foreground text-sm">{t('noSubServersMessage')}</p>
                                  )}
                                </div>
                              )}
                              
                              <FormField
                                  control={form.control}
                                  name="duration"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('testDuration')}</FormLabel>
                                      <FormControl>
                                      <Input type="number" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="package"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('testPackage')}</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                          <SelectValue placeholder="Select a package" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value="all_channels">All Channels</SelectItem>
                                          <SelectItem value="sports_only">Sports Only</SelectItem>
                                          <SelectItem value="movies_only">Movies Only</SelectItem>
                                      </SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                          </form>
                        </Form>
                      </div>
                  )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            {selectedClient && selectedPanel && (
              <Button type="submit" form="test-form">{t('addTest')}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PanelSelectionModal 
        isOpen={isPanelModalOpen}
        onClose={() => setIsPanelModalOpen(false)}
        onSelectPanel={handleSelectPanel}
      />
    </>
  );
}
