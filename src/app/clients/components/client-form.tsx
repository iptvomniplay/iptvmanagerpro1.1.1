'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import type { Client, Phone } from '@/lib/types';
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
import { PhoneInputModal } from '@/components/ui/phone-input-modal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { BirthdateInput } from '@/components/ui/birthdate-input';
import { Textarea } from '@/components/ui/textarea';


const phoneSchema = z.object({
  type: z.enum(['celular', 'fixo', 'ddi']),
  number: z.string(),
});

const createFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: t('nameValidation') }),
  nickname: z.string().optional(),
  email: z.string().email({ message: t('emailValidation') }).optional().or(z.literal('')),
  phones: z.array(phoneSchema).min(1, { message: t('phoneRequired') }),
  birthDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Expired', 'Test'], { required_error: t('statusRequired') }),
  observations: z.string().optional(),
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
  const [isPhoneModalOpen, setIsPhoneModalOpen] = React.useState(false);
  
  const formSchema = createFormSchema(t);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      nickname: client?.nickname || '',
      email: client?.email || '',
      phones: client?.phones || [],
      birthDate: client?.birthDate || '',
      status: client?.status || 'Inactive',
      observations: client?.observations || '',
    },
  });

  const { control, reset, trigger } = form;
  const { fields: phoneFields, replace: replacePhones, remove: removePhone } = useFieldArray({ control, name: 'phones' });

  const handlePhoneSave = (newPhones: Phone[]) => {
    replacePhones(newPhones);
    trigger('phones');
    setIsPhoneModalOpen(false);
  };

  const handleSubmit = (values: ClientFormValues) => {
    setClientDataToConfirm(values);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!clientDataToConfirm) return;
    
    const clientData = {
      ...clientDataToConfirm,
      phones: clientDataToConfirm.phones,
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
        status: 'Inactive',
        birthDate: '',
        observations: '',
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
                    <Input placeholder={t('namePlaceholder')} {...field} autoComplete="off" />
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
                    <Input placeholder={t('nicknamePlaceholder')} {...field} autoComplete="off" />
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
                    <Input placeholder={t('emailPlaceholder')} {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="w-full md:w-1/2 space-y-2">
            <Button type="button" variant="default" onClick={() => setIsPhoneModalOpen(true)}>
              {t('addPhone')}
            </Button>
            
            <FormField
              control={control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('birthDate')}</FormLabel>
                  <FormControl>
                    <BirthdateInput field={field} language={language} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  className="w-full justify-between"
                  variant="default"
                >
                  {t('observations')}
                  <ChevronsUpDown className="h-5 w-5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                 <FormField
                    control={control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormControl>
                          <Textarea
                            placeholder={t('observationsPlaceholder')}
                            {...field}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CollapsibleContent>
            </Collapsible>
            
            <FormField
              control={form.control}
              name="phones"
              render={() => (
                <FormItem>
                  {phoneFields.length > 0 && (
                    <Collapsible className="space-y-2">
                       <CollapsibleTrigger asChild>
                         <div className="flex items-center justify-between p-3 rounded-md border bg-muted cursor-pointer">
                            <span className="font-semibold">{t('phone')} - {phoneFields.length} {t('registered')}</span>
                            <div className="flex items-center">
                                <Badge variant="secondary">{phoneFields.length}</Badge>
                                <ChevronDown className="h-5 w-5 ml-2" />
                            </div>
                         </div>
                       </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2">
                        {phoneFields.map((field, index) => (
                           <div key={field.id} className="flex items-center justify-between p-2 pl-4 rounded-md border">
                            <span className="text-sm">({t(field.type as any)}) {field.number}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePhone(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full md:w-1/2">
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
      
      <PhoneInputModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSave={handlePhoneSave}
        initialPhones={phoneFields}
      />

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
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleSuccessModalClose();
          } else {
            setIsSuccessModalOpen(true);
          }
        }}
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
