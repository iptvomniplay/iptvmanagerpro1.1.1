'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client } from '@/lib/types';
import type { ClientFormValues } from './clients-page-content';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';

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
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  nickname: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  hasDDI: z.boolean().default(false).optional(),
  birthDate: z.date().optional(),
  status: z.enum(['Active', 'Inactive', 'Expired']),
  expiryDate: z.date({
    required_error: 'An expiry date is required.',
  }),
});

interface ClientFormProps {
  client: Client | null;
  onCancel?: () => void;
  onSubmitted?: () => void;
}

export function ClientForm({ client, onCancel, onSubmitted }: ClientFormProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { addClient, updateClient } = useData();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      nickname: client?.nickname || '',
      email: client?.email || '',
      phone: client?.phone || '',
      hasDDI: client?.hasDDI || false,
      birthDate: client?.birthDate ? new Date(client.birthDate) : undefined,
      status: client?.status || 'Active',
      expiryDate: client?.expiryDate ? new Date(client.expiryDate) : undefined,
    },
  });

  const { watch, setValue } = form;
  const hasDDI = watch('hasDDI');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (language === 'pt-BR' && !hasDDI) {
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    setValue('phone', value);
  };


  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const clientData = {
      ...values,
      birthDate: values.birthDate?.toISOString().split('T')[0],
      expiryDate: values.expiryDate.toISOString().split('T')[0],
    };

    if (client) {
      updateClient({ ...client, ...clientData });
    } else {
      addClient(clientData as Omit<Client, 'id' | 'registeredDate'>);
    }

    if (onSubmitted) {
      onSubmitted();
    } else {
      router.push('/clients');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fullName')}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('emailAddress')}</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
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
                <div className="flex justify-between items-center">
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormField
                        control={form.control}
                        name="hasDDI"
                        render={({ field: ddiField }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                checked={ddiField.value}
                                onCheckedChange={ddiField.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                                {t('hasDDI')}
                            </FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
                <FormControl>
                <Input 
                    {...field}
                    onChange={handlePhoneChange}
                    placeholder={language === 'pt-BR' && !hasDDI ? '(11) 99999-9999' : t('phonePlaceholder')}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('dateOfBirth')}</FormLabel>
               <DatePicker
                date={field.value}
                setDate={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('expiryDate')}</FormLabel>
                 <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="Active">{t('active')}</SelectItem>
                    <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                    <SelectItem value="Expired">{t('expired')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
            </Button>
            <Button type="submit">
                {client ? t('saveChanges') : t('createClient')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
