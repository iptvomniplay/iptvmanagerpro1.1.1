'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Server, SubServer } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const subServerSchema = z.object({
    name: z.string().min(1, "Server name is required"),
    type: z.string().min(1, "Server type is required"),
    screens: z.coerce.number().min(0, "Screens must be a positive number"),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  login: z.string().min(1, { message: 'Login is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  responsibleName: z.string().min(2, { message: 'Responsible name is required.' }),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  paymentType: z.enum(['prepaid', 'postpaid']).default('prepaid'),
  panelValue: z.string().optional(),
  dueDate: z.coerce.number().optional(),
  hasInitialStock: z.boolean().default(false).optional(),
  creditStock: z.coerce.number().optional(),
  subServers: z.array(subServerSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.paymentType === 'postpaid') {
        if (!data.panelValue) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Panel value is required.",
                path: ["panelValue"],
            });
        }
        if (data.dueDate === undefined || data.dueDate < 1 || data.dueDate > 31) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Due date must be between 1 and 31.",
                path: ["dueDate"],
            });
        }
    }
});

type ServerFormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
  server: Server | null;
}

export function ServerForm({ server }: ServerFormProps) {
  const { t, language } = useLanguage();
  const { addServer, updateServer } = useData();
  const router = useRouter();
  const [isPanelFormVisible, setIsPanelFormVisible] = React.useState(!!server);
  
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || '',
      url: server?.url || '',
      login: '',
      password: '',
      responsibleName: server?.responsibleName || '',
      nickname: server?.nickname || '',
      phone: server?.phone || '',
      paymentType: server?.paymentType || 'prepaid',
      panelValue: server?.panelValue || '',
      dueDate: server?.dueDate || 1,
      hasInitialStock: !!server?.creditStock,
      creditStock: server?.creditStock || undefined,
      subServers: server?.subServers || [],
    },
  });

  const { control, watch, setValue } = form;
  const paymentType = watch('paymentType');
  const hasInitialStock = watch('hasInitialStock');
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subServers",
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ServerFormValues) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (!value) {
        setValue(fieldName as any, '');
        return;
    }
    const numericValue = parseInt(value, 10) / 100;
    
    const formatter = new Intl.NumberFormat(language, {
      style: 'currency',
      currency: language === 'pt-BR' ? 'BRL' : 'USD',
    });
    
    setValue(fieldName as any, formatter.format(numericValue));
  };

  const handleSubmit = (values: ServerFormValues) => {
    const serverData: Server = {
        ...values,
        id: server?.id || '',
        subServers: values.subServers || [],
    };
    if (server) {
        updateServer(serverData);
    } else {
        addServer(serverData);
    }
    router.push('/servers');
  };
  
  const handleCancel = () => {
    router.push('/servers');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <div className="mb-6">
            <Button type="button" onClick={() => setIsPanelFormVisible(!isPanelFormVisible)} disabled={!!server}>
                <PlusCircle className="mr-2 h-5 w-5" />
                {t('addNewPanel')}
            </Button>
        </div>
        
        <div className={cn("space-y-6", isPanelFormVisible ? 'block' : 'hidden')}>
          <FormField
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
          <FormField
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
            name="paymentType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('paymentMethod')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="prepaid" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('prepaid')}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="postpaid" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('postpaid')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {paymentType === 'postpaid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="panelValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('panelValue')}</FormLabel>
                     <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleCurrencyChange(e, 'panelValue')}
                        placeholder={language === 'pt-BR' ? 'R$ 0,00' : '$ 0.00'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dueDate')}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || 1)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
            <FormField
              control={control}
              name="hasInitialStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t('hasPanelCredits')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {hasInitialStock && (
                <FormField
                    control={control}
                    name="creditStock"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('panelCreditStock')}</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>{t('panelCreditStockDescription')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Servidores</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', type: '', screens: 0 })}
            >
              Adicionar Servidor
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end p-4 border rounded-lg">
                <FormField
                  control={control}
                  name={`subServers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Servidor</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`subServers.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Servidor</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={control}
                  name={`subServers.${index}.screens`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Telas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
                 <div className="text-center text-muted-foreground py-4">
                    Nenhum servidor cadastrado. Clique em "Adicionar Servidor" para começar.
                  </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
            </Button>
            <Button type="submit">
                {server ? t('saveChanges') : t('registerClient')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
