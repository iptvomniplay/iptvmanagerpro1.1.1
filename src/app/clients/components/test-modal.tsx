'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client } from '@/lib/types';
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
import { Search, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema(t)),
    defaultValues: {
      duration: 24,
      package: 'all_channels',
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedTerm) ||
        (client.phone && client.phone.includes(lowercasedTerm)) ||
        (client.nickname && client.nickname.toLowerCase().includes(lowercasedTerm))
    );
    setSearchResults(results);
  };
  
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSubmit = (values: TestFormValues) => {
    console.log('Test data:', { ...values, clientId: selectedClient?.id });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setSelectedClient(null);
        setSearchTerm('');
        setSearchResults([]);
        form.reset();
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="h-screen w-screen max-w-none flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">{t('addTestToClient')}</DialogTitle>
          <DialogDescription>{t('addTestToClientDescription')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="grid md:grid-cols-2 p-6 gap-8 h-full">
            <div className="space-y-6">
               <h3 className="text-xl font-semibold">{t('searchClient')}</h3>
               <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('searchClientPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" /> {t('searchClient')}
                </Button>
              </form>
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
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <Button variant="outline" size="sm">{t('selectClient')}</Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
               {searchResults.length === 0 && searchTerm && (
                 <p className="text-center text-muted-foreground pt-8">{t('noClientFound')}</p>
               )}
            </div>

            <div className="space-y-6">
                {selectedClient ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 rounded-lg border p-4 bg-accent">
                            <User className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('client')}</p>
                                <p className="text-lg font-semibold">{selectedClient.name}</p>
                            </div>
                        </div>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <h3 className="text-xl font-semibold">{t('testDetails')}</h3>
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
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>{t('selectClientPrompt')}</p>
                    </div>
                )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          {selectedClient && (
             <Button type="submit" form="test-form" onClick={form.handleSubmit(handleSubmit)}>{t('addTest')}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
