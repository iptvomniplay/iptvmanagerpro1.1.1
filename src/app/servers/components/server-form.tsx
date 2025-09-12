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
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  login: z.string().min(1, { message: 'Login is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  responsibleName: z.string().min(2, { message: 'Responsible name is required.' }),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  paymentType: z.enum(['prepaid', 'postpaid']).default('prepaid'),
  quantityOfCredits: z.coerce.number().optional(),
  totalPurchaseValue: z.string().optional(),
  panelValue: z.string().optional(),
  dueDate: z.coerce.number().optional(),
  panelCreditStock: z.coerce.number().optional(),
  status: z.enum(['Online', 'Offline']),
  connections: z.coerce.number().min(0),
  maxConnections: z.coerce.number().min(1),
  cpuLoad: z.coerce.number().min(0).max(100),
}).refine(data => {
    if (data.paymentType === 'prepaid') {
        return data.quantityOfCredits !== undefined && data.totalPurchaseValue !== undefined;
    }
    return true;
}, {
    message: "Prepaid fields are required.",
    path: ["quantityOfCredits"], 
}).refine(data => {
    if (data.paymentType === 'postpaid') {
        return data.panelValue !== undefined && data.dueDate !== undefined;
    }
    return true;
}, {
    message: "Postpaid fields are required.",
    path: ["panelValue"],
});

type ServerFormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
  server: Server | null;
}

export function ServerForm({ server }: ServerFormProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isPanelFormVisible, setIsPanelFormVisible] = React.useState(false);
  
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || '',
      url: server?.url || '',
      login: '',
      password: '',
      responsibleName: '',
      nickname: '',
      phone: '',
      paymentType: 'prepaid',
      status: server?.status || 'Online',
      connections: server?.connections || 0,
      maxConnections: server?.maxConnections || 1000,
      cpuLoad: server?.cpuLoad || 0,
    },
  });

  const { watch, setValue } = form;
  const paymentType = watch('paymentType');
  const quantityOfCredits = watch('quantityOfCredits');
  const totalPurchaseValue = watch('totalPurchaseValue');

  const unitValue = React.useMemo(() => {
    const total = parseFloat((totalPurchaseValue || '0').replace(/[^0-9,]/g, '').replace(',', '.'));
    if (quantityOfCredits && total > 0 && quantityOfCredits > 0) {
      return (total / quantityOfCredits).toFixed(2);
    }
    return '0.00';
  }, [quantityOfCredits, totalPurchaseValue]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ServerFormValues) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    value = (parseInt(value, 10) / 100).toFixed(2);
    
    const formatter = new Intl.NumberFormat(language, {
      style: 'currency',
      currency: language === 'pt-BR' ? 'BRL' : 'USD',
    });
    
    setValue(fieldName, formatter.format(parseFloat(value)));
  };

  const handleSubmit = (values: ServerFormValues) => {
    console.log('Form values:', values);
  };
  
  const handleCancel = () => {
    router.push('/servers');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <div className="mb-6">
            <Button type="button" onClick={() => setIsPanelFormVisible(!isPanelFormVisible)}>
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

          {paymentType === 'prepaid' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="quantityOfCredits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quantityOfCredits')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalPurchaseValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('totalPurchaseValue')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleCurrencyChange(e, 'totalPurchaseValue')}
                        placeholder={language === 'pt-BR' ? 'R$ 0,00' : '$ 0.00'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t('unitValue')}</FormLabel>
                <FormControl>
                    <Input value={new Intl.NumberFormat(language, { style: 'currency', currency: language === 'pt-BR' ? 'BRL' : 'USD' }).format(parseFloat(unitValue))} disabled />
                </FormControl>
              </FormItem>
            </div>
          )}

          {paymentType === 'postpaid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
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
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dueDate')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
             <FormField
                control={form.control}
                name="panelCreditStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('panelCreditStock')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                     <FormDescription>{t('panelCreditStockDescription')}</FormDescription>
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
            <Button type="submit">
                {t('next')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
