'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import type { Client } from '@/lib/types';
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
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmationModal } from './confirmation-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';


const createFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('nameValidation') }),
  nickname: z.string().optional(),
  email: z.string().email({ message: t('emailValidation') }).optional().or(z.literal('')),
  phones: z.array(z.string()).min(1, { message: t('phoneRequired') }),
  birthDate: z.date({ required_error: t('birthDateRequired') }),
  status: z.enum(['Active', 'Inactive', 'Expired', 'Test'], { required_error: t('statusRequired') }),
});

export type ClientFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface ClientFormProps {
  client: Client | null;
  onCancel?: () => void;
  onSubmitted?: () => void;
}

export function ClientForm({ client, onCancel, onSubmitted }: ClientFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { addClient, updateClient } = useData();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [clientDataToConfirm, setClientDataToConfirm] = React.useState<ClientFormValues | null>(null);
  const [currentPhone, setCurrentPhone] = React.useState('');

  const formSchema = createFormSchema(t);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      nickname: client?.nickname || '',
      email: client?.email || '',
      phones: client?.phones || [],
      birthDate: client?.birthDate ? new Date(client.birthDate) : undefined,
      status: client?.status || undefined,
    },
  });

  const { control, reset, getValues, trigger } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'phones' });

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else {
      value = value.replace(/^(\d*)/, '($1');
    }
    
    setCurrentPhone(value);
  };

  const handleAddPhone = () => {
    if (currentPhone.trim()) {
      append(currentPhone.trim());
      setCurrentPhone('');
      trigger('phones');
    }
  };

  const handleSubmit = (values: ClientFormValues) => {
    setClientDataToConfirm(values);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!clientDataToConfirm) return;
    
    const clientData = {
      ...clientDataToConfirm,
      birthDate: clientDataToConfirm.birthDate.toISOString().split('T')[0],
    };

    if (client) {
      updateClient({ ...client, ...clientData, id: client.id, registeredDate: client.registeredDate });
    } else {
      addClient(clientData as Omit<Client, 'id' | 'registeredDate'>);
    }

    setIsConfirmationModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    if (onSubmitted) {
      onSubmitted();
    } else {
       reset({
        name: '',
        nickname: '',
        email: '',
        phones: [],
        birthDate: undefined,
        status: undefined,
      });
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/2">
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
          </div>
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('emailAddress')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="w-full md:w-1/2">
             <FormField
              control={form.control}
              name="phones"
              render={() => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                        value={currentPhone}
                        onChange={handlePhoneInputChange}
                        placeholder={t('phonePtBRPlaceholder')}
                    />
                    <Button type="button" onClick={handleAddPhone}>{t('add')}</Button>
                  </div>
                   <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex flex-wrap gap-2 mt-2">
              {fields.map((field, index) => (
                <Badge key={field.id} variant="secondary" className="flex items-center gap-2 text-base">
                  {field.value}
                  <button type="button" onClick={() => remove(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>


          <div className="w-full md:w-[240px]">
            <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('birthDate')}</FormLabel>
                    <FormControl>
                        <DatePicker 
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <div className="w-full md:w-[240px]">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">{t('active')}</SelectItem>
                      <SelectItem value="Expired">{t('expired')}</SelectItem>
                      <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                      <SelectItem value="Test">{t('test')}</SelectItem>
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
                  {client ? t('saveChanges') : t('save')}
              </Button>
          </div>
        </form>
      </Form>

      {clientDataToConfirm && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleConfirmSave}
          clientData={clientDataToConfirm}
        />
      )}

      <AlertDialog
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('registrationAddedSuccess')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(client ? 'editClientSuccess' : 'newClientSuccess')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSuccessModalClose}>
            {t('ok')}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
