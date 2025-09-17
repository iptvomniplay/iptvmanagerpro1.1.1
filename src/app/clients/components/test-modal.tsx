'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client, Server, SubServer, Test } from '@/lib/types';
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
import { Search, User, Server as ServerIcon, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { normalizeString, cn } from '@/lib/utils';
import { PanelSelectionModal } from './panel-selection-modal';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const testFormSchema = (t: (key: string) => string) => z.object({
  durationValue: z.coerce.number().positive({ message: t('durationPositive') }),
  durationUnit: z.enum(['hours', 'days'], { required_error: t('durationUnitRequired') }),
  package: z.string().min(1, { message: t('plansRequired') }),
});

type TestFormValues = z.infer<ReturnType<typeof testFormSchema>>;

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestModal({ isOpen, onClose }: TestModalProps) {
  const { t } = useLanguage();
  const { clients, updateClient, addTestToClient } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isPanelModalOpen, setIsPanelModalOpen] = React.useState(false);
  const [selectedPanel, setSelectedPanel] = React.useState<Server | null>(null);
  const [selectedSubServer, setSelectedSubServer] = React.useState<SubServer | null>(null);
  const [availablePackages, setAvailablePackages] = React.useState<string[]>([]);


  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema(t)),
    defaultValues: {
      durationValue: undefined,
      durationUnit: 'hours',
      package: undefined,
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
        const clientPhoneMatch = client.phones.some(phone => normalizeString(phone.number).replace(/\D/g, '').includes(normalizedTerm.replace(/\D/g, '')));
        
        return (
            normalizedName.includes(normalizedTerm) ||
            (normalizedNickname && normalizedNickname.includes(normalizedTerm)) ||
            clientPhoneMatch
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
    setSelectedSubServer(null);

    const packages = panel.subServers?.flatMap(sub => sub.plans) || [];
    const uniquePackages = Array.from(new Set(packages));
    setAvailablePackages(uniquePackages);
    
    form.resetField('package');

    setIsPanelModalOpen(false);
  };

  const handleSubmit = (values: TestFormValues) => {
    if (selectedClient && selectedPanel && selectedSubServer) {
      const newTest: Omit<Test, 'creationDate'> = {
        clientId: selectedClient.id,
        panelId: selectedPanel.id,
        subServerName: selectedSubServer.name,
        package: values.package,
        durationValue: values.durationValue,
        durationUnit: values.durationUnit,
      };
      addTestToClient(selectedClient.id, newTest);
       if (selectedClient) {
        updateClient({ ...selectedClient, status: 'Test' });
      }
    }
    console.log('Test data:', { ...values, clientId: selectedClient?.id, panelId: selectedPanel?.id, subServer: selectedSubServer });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setSelectedClient(null);
        setSelectedPanel(null);
        setSelectedSubServer(null);
        setSearchTerm('');
        setSearchResults([]);
        setAvailablePackages([]);
        form.reset();
    }, 300)
  }

  const getStatusVariant = (status: SubServer['status']) => {
    switch (status) {
      case 'Online':
        return 'success';
      case 'Offline':
        return 'inactive';
      case 'Suspended':
        return 'destructive';
      case 'Maintenance':
        return 'warning';
      default:
        return 'outline';
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="h-screen w-screen max-w-none flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Configure 1 teste</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
             <Form {...form}>
              <form id="test-form" onSubmit={form.handleSubmit(handleSubmit)} className="p-6 h-full space-y-8">
                  <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{t('searchClient')}</h3>
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
                                  <p className="text-sm text-muted-foreground">{client.phones[0]?.number}</p>
                                </div>
                                <Button variant="outline" size="sm">{t('selectClient')}</Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
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
                      
                    <div className="space-y-6">
                        {!selectedClient && (
                          <>
                            {searchTerm && searchResults.length === 0 && (
                              <div className="flex items-center justify-center text-muted-foreground text-center rounded-lg border border-dashed py-10">
                                <p>{t('noClientFound')}</p>
                              </div>
                            )}
                            {!searchTerm && (
                              <div className="flex items-center justify-center h-full text-muted-foreground text-center rounded-lg border border-dashed py-10">
                                  <p>{t('awaitingInput')}</p>
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">{t('testDetails')}</h3>
                              <FormField
                                control={form.control}
                                name="durationValue"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('testDuration')}</FormLabel>
                                      <div className="flex items-start gap-4">
                                            <FormControl className="flex-1">
                                                <Input type="number" {...field} value={field.value ?? ''} placeholder='' />
                                            </FormControl>
                                            <FormField
                                                control={form.control}
                                                name="durationUnit"
                                                render={({ field: unitField }) => (
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={unitField.onChange}
                                                            defaultValue={unitField.value}
                                                            className="flex items-center space-x-4 pt-2"
                                                        >
                                                            <FormItem className="flex items-center space-x-2">
                                                                <RadioGroupItem value="hours" id="hours" />
                                                                <Label htmlFor="hours" className="font-normal cursor-pointer">{t('hours')}</Label>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-2">
                                                                <RadioGroupItem value="days" id="days" />
                                                                <Label htmlFor="days" className="font-normal cursor-pointer">{t('days')}</Label>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                )}
                                            />
                                      </div>
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={availablePackages.length === 0}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder={t('selectPackagePlaceholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availablePackages.map((pkg) => (
                                          <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
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

                          {selectedPanel && selectedPanel.subServers && selectedPanel.subServers.length > 0 && (
                              <Collapsible className="space-y-2">
                              <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-3 rounded-md border bg-muted cursor-pointer">
                                      <span className="font-semibold">{t('subServerDetails')}</span>
                                      <div className="flex items-center">
                                          <Badge variant="secondary">{selectedPanel.subServers.length}</Badge>
                                          <ChevronDown className="h-5 w-5 ml-2" />
                                      </div>
                                  </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2 pt-2">
                                  {selectedPanel.subServers.map((sub) => (
                                  <Collapsible key={sub.name} asChild>
                                      <div className={cn(
                                          "rounded-md border transition-colors",
                                          selectedSubServer?.name === sub.name && "bg-primary/10 border-primary ring-2 ring-primary"
                                      )}>
                                          <div 
                                              className="flex items-center justify-between p-3 cursor-pointer"
                                              onClick={() => setSelectedSubServer(sub)}
                                          >
                                            <p className="font-semibold truncate mr-4">{sub.name}</p>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={getStatusVariant(sub.status)} className="cursor-pointer text-base">
                                                    {t(sub.status.toLowerCase().replace(' ', '') as any)}
                                                </Badge>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                        <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                                                        <span className="sr-only">Details</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                          </div>
                                          <CollapsibleContent className="px-3 pb-3">
                                              <div className="space-y-2 pt-2 border-t text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                      <p className="font-semibold">{t('status')}:</p>
                                                      <Badge variant={getStatusVariant(sub.status)} className="text-base">
                                                        {t(sub.status.toLowerCase().replace(' ', '') as any)}
                                                      </Badge>
                                                    </div>
                                                  <p><span className='font-semibold'>{t('subServerType')}:</span> {sub.type}</p>
                                                  <p><span className='font-semibold'>{t('screens')}:</span> {sub.screens}</p>
                                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                                      <span className='font-semibold'>{t('plans')}:</span>
                                                      {sub.plans.map((plan, planIndex) => (
                                                          <Badge key={planIndex} variant="secondary">{plan}</Badge>
                                                      ))}
                                                  </div>
                                              </div>
                                          </CollapsibleContent>
                                      </div>
                                  </Collapsible>
                                  ))}
                              </CollapsibleContent>
                              </Collapsible>
                          )}
                        </div>
                    </div>
                  </div>
                </form>
            </Form>
          </ScrollArea>

          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            {selectedClient && selectedPanel && selectedSubServer && (
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
