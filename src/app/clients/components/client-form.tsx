'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
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


const createFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('nameValidation') }),
  nickname: z.string().optional(),
  email: z.string().email({ message: t('emailValidation') }).optional().or(z.literal('')),
  phone: z.string().min(1, { message: t('phoneRequired') }),
  hasDDI: z.boolean().default(false).optional(),
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
  const { t, language } = useLanguage();
  const router = useRouter();
  const { addClient, updateClient } = useData();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [clientDataToConfirm, setClientDataToConfirm] = React.useState<ClientFormValues | null>(null);

  const formSchema = createFormSchema(t);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      nickname: client?.nickname || '',
      email: client?.email || '',
      phone: client?.phone || '',
      hasDDI: client?.hasDDI || false,
      birthDate: client?.birthDate ? new Date(client.birthDate) : undefined,
      status: client?.status || undefined,
    },
  });

  const { watch, setValue, reset } = form;
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

  const handleSubmit = (values: ClientFormValues) => {
    setClientDataToConfirm(values);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!clientDataToConfirm) return;
    
    const clientData = {
      ...clientDataToConfirm,
      birthDate: clientDataToConfirm.birthDate ? clientDataToConfirm.birthDate.toISOString().split('T')[0] : undefined,
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
        phone: '',
        hasDDI: false,
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormField
                      control={form.control}
                      name="hasDDI"
                      render={({ field: ddiField }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0 my-2">
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
                  <FormControl>
                    <Input 
                        {...field}
                        onChange={handlePhoneChange}
                        placeholder={language === 'pt-BR' && !hasDDI ? t('phonePtBRPlaceholder') : t('phonePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-1/2">
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
