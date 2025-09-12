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
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  responsibleName: z.string().min(2, { message: 'Responsible name is required.' }),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  login: z.string().min(1, { message: 'Login is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  status: z.enum(['Online', 'Offline']),
  connections: z.coerce.number().min(0),
  maxConnections: z.coerce.number().min(1),
  cpuLoad: z.coerce.number().min(0).max(100),
});

type ServerFormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
  server: Server | null;
}

export function ServerForm({ server }: ServerFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPanelFormVisible, setIsPanelFormVisible] = React.useState(false);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || '',
      url: server?.url || '',
      responsibleName: '',
      nickname: '',
      phone: '',
      login: '',
      password: '',
      status: server?.status || 'Online',
      connections: server?.connections || 0,
      maxConnections: server?.maxConnections || 1000,
      cpuLoad: server?.cpuLoad || 0,
    },
  });

  const handleSubmit = (values: ServerFormValues) => {
    // Action removed as requested.
    console.log('Form values:', values);
  };
  
  const handleCancel = () => {
    router.push('/servers');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <div className="mb-6">
            <Button type="button" onClick={() => setIsPanelFormVisible(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                {t('addNewPanel')}
            </Button>
        </div>
        
        <div className={cn("space-y-6", isPanelFormVisible ? 'block' : 'hidden')}>
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
                <FormLabel>{t('panelUrl')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('serverUrlPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsibleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('responsibleName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('nickname')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('nicknamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input placeholder="+55 (11) 91234-5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
            </Button>
            <Button type="button" onClick={() => handleSubmit(form.getValues())}>
                {t('next')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
