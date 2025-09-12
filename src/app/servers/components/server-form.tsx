'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Server } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  status: z.enum(['Online', 'Offline']),
  connections: z.coerce.number().min(0),
  maxConnections: z.coerce.number().min(1),
  cpuLoad: z.coerce.number().min(0).max(100),
});

type ServerFormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
  server: Server | null;
  onSubmit: (values: ServerFormValues) => void;
  onCancel: () => void;
}

export function ServerForm({ server, onSubmit, onCancel }: ServerFormProps) {
  const { t } = useLanguage();
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || '',
      url: server?.url || '',
      status: server?.status || 'Online',
      connections: server?.connections || 0,
      maxConnections: server?.maxConnections || 1000,
      cpuLoad: server?.cpuLoad || 0,
    },
  });

  const handleSubmit = (values: ServerFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('serverName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('serverNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('serverUrl')}</FormLabel>
              <FormControl>
                <Input placeholder={t('serverUrlPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('status')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Online">{t('online')}</SelectItem>
                    <SelectItem value="Offline">{t('offline')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-6">
           <FormField
            control={form.control}
            name="connections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('connections')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxConnections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('maxConnections')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="cpuLoad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('cpuLoad')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
                {t('cancel')}
            </Button>
            <Button type="submit">
                {server ? t('saveChanges') : t('addPanel')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
