'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { PlusCircle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ConfirmationModal } from './confirmation-modal';
import { Badge } from '@/components/ui/badge';

const createSubServerSchema = (t: (key: any) => string) => z.object({
  name: z.string().min(1, t('serverNameRequired')),
  type: z.string().min(1, t('serverTypeRequired')),
  screens: z.coerce
    .number({ required_error: t('screensRequired') })
    .min(1, t('screensMin')),
  plans: z.array(z.string()).min(1, t('atLeastOnePlanRequired')),
});

const createFormSchema = (t: (key: any) => string) =>
  z
    .object({
      name: z.string().min(2, { message: t('nameMustBeAtLeast2') }),
      url: z.string().min(1, { message: t('urlIsRequired') }),
      login: z.string().min(1, { message: t('loginIsRequired') }),
      password: z.string().min(1, { message: t('passwordIsRequired') }),
      responsibleName: z
        .string()
        .min(2, { message: t('responsibleNameIsRequired') }),
      nickname: z.string().optional(),
      phone: z.string().optional(),
      hasDDI: z.boolean().default(false).optional(),
      paymentType: z.enum(['prepaid', 'postpaid']).default('prepaid'),
      panelValue: z.string().optional(),
      dueDate: z.coerce.number().optional(),
      hasInitialStock: z.boolean().default(false).optional(),
      creditStock: z.coerce.number().optional(),
      subServers: z.array(createSubServerSchema(t)).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.paymentType === 'postpaid') {
        if (!data.panelValue) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('panelValueIsRequired'),
            path: ['panelValue'],
          });
        }
        if (
          data.dueDate === undefined ||
          data.dueDate < 1 ||
          data.dueDate > 31
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('dueDateIsRequired'),
            path: ['dueDate'],
          });
        }
      }
      if (
        data.hasInitialStock &&
        (data.creditStock === undefined || data.creditStock <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('creditStockIsRequired'),
          path: ['creditStock'],
        });
      }
    });

interface ServerFormProps {
  server: Server | null;
}

type ServerFormValues = z.infer<ReturnType<typeof createFormSchema>>;
type SubServerFormValues = z.infer<ReturnType<typeof createSubServerSchema>>;

const getInitialValues = (server: Server | null) => ({
  name: server?.name || '',
  url: server?.url || '',
  login: '',
  password: '',
  responsibleName: server?.responsibleName || '',
  nickname: server?.nickname || '',
  phone: server?.phone || '',
  hasDDI: server?.hasDDI || false,
  paymentType: server?.paymentType || 'prepaid',
  panelValue: server?.panelValue || '',
  dueDate: server?.dueDate || undefined,
  hasInitialStock: !!server?.creditStock,
  creditStock: server?.creditStock || undefined,
  subServers: server?.subServers || [],
});

const initialSubServerValues: SubServerFormValues = {
    name: '',
    type: '',
    screens: undefined as any,
    plans: [],
};

export function ServerForm({ server }: ServerFormProps) {
  const { t, language } = useLanguage();
  const { addServer, updateServer } = useData();
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [serverDataToConfirm, setServerDataToConfirm] = React.useState<ServerFormValues | null>(null);
  const [currentPlanInput, setCurrentPlanInput] = React.useState('');
  const [subServerFormState, setSubServerFormState] = React.useState<SubServerFormValues>(initialSubServerValues);
  const [subServerErrors, setSubServerErrors] = React.useState<Record<string, string | undefined>>({});


  const formSchema = createFormSchema(t);
  const subServerSchema = createSubServerSchema(t);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(server),
  });

  const { control, watch, setValue, reset, trigger } = form;
  const paymentType = watch('paymentType');
  const hasInitialStock = watch('hasInitialStock');
  const hasDDI = watch('hasDDI');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subServers',
  });

  const [isPanelFormVisible, setIsPanelFormVisible] = React.useState(!!server);
  const [isServerSectionVisible, setIsServerSectionVisible] =
    React.useState(!!server?.subServers?.length);


  const handleAddPlan = () => {
    if (currentPlanInput.trim()) {
        setSubServerFormState(prev => ({
            ...prev,
            plans: [...prev.plans, currentPlanInput.trim()]
        }));
        setCurrentPlanInput('');
        if (subServerErrors.plans) {
            setSubServerErrors(prev => ({...prev, plans: undefined}));
        }
    }
  };
  
  const handleRemovePlan = (planIndex: number) => {
    setSubServerFormState(prev => ({
        ...prev,
        plans: prev.plans.filter((_, i) => i !== planIndex)
    }));
  };

  const handleAddSubServer = () => {
    const result = subServerSchema.safeParse(subServerFormState);
    if (result.success) {
      append(result.data);
      setSubServerFormState(initialSubServerValues);
      setSubServerErrors({});
    } else {
        const errors: Record<string, string> = {};
        result.error.errors.forEach(err => {
            if (err.path[0]) {
                errors[err.path[0]] = err.message;
            }
        });
        setSubServerErrors(errors);
    }
  }

  const handleSubServerInputChange = (field: keyof SubServerFormValues, value: any) => {
    setSubServerFormState(prev => ({...prev, [field]: value}));
     if (subServerErrors[field]) {
        setSubServerErrors(prev => ({...prev, [field]: undefined}));
    }
  }

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ServerFormValues
  ) => {
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (language === 'pt-BR' && !hasDDI) {
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    setValue('phone', value);
  };

  const handleSubmit = (values: ServerFormValues) => {
    setServerDataToConfirm(values);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!serverDataToConfirm) return;
    
    if (server) {
      const serverData: Server = {
          ...serverDataToConfirm,
          id: server.id,
          status: server.status,
          subServers: serverDataToConfirm.subServers || [],
      };
      updateServer(serverData);
    } else {
        const { login, password, ...rest } = serverDataToConfirm;
        const serverData: Omit<Server, 'id' | 'status'> = {
            ...rest,
            subServers: serverDataToConfirm.subServers || [],
        };
        addServer(serverData);
    }
    setIsConfirmationModalOpen(false);
    setIsSuccessModalOpen(true);
  }

  const handleCancel = () => {
    router.push('/servers');
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    if (server) {
      router.push('/servers');
    } else {
      reset(getInitialValues(null));
      setIsPanelFormVisible(false);
      setIsServerSectionVisible(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
          <Button
            type="button"
            onClick={() => setIsPanelFormVisible(!isPanelFormVisible)}
            disabled={!!server}
            className="w-48"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('addNewPanel')}
          </Button>

          <div
            className={cn('space-y-6', isPanelFormVisible ? 'block' : 'hidden')}
          >
            <div className="md:w-1/2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('serverName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('serverNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/2">
              <FormField
                control={control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('panelUrl')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('serverUrlPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/2">
              <FormField
                control={control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('loginPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/2">
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder={t('passwordPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/2">
              <FormField
                control={control}
                name="responsibleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('responsibleName')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('responsibleNamePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/2">
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
            </div>

            <div className="md:w-1/2">
              <FormField
                control={control}
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
                        placeholder={
                          language === 'pt-BR' && !hasDDI
                            ? t('phonePtBRPlaceholder')
                            : t('phonePlaceholder')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        <FormLabel className="font-normal">
                          {t('prepaid')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="postpaid" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('postpaid')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentType === 'postpaid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:w-1/2">
                <FormField
                  control={control}
                  name="panelValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('panelValue')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => handleCurrencyChange(e, 'panelValue')}
                          placeholder={
                            language === 'pt-BR' ? t('currencyPlaceholderBRL') : t('currencyPlaceholderUSD')
                          }
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
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={String(field.value || '')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectDay')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <SelectItem key={day} value={String(day)}>
                                {day}
                              </SelectItem>
                            )
                          )}
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm md:w-1/2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('hasPanelCredits')}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {hasInitialStock && (
              <div className="md:w-1/2">
                <FormField
                  control={control}
                  name="creditStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('panelCreditStock')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          placeholder={t('creditStockPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('panelCreditStockDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className={cn(isPanelFormVisible ? 'block' : 'hidden')}>
            <Button
              type="button"
              onClick={() => setIsServerSectionVisible(true)}
              className="w-48 mt-6"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('Add Servidores')}
            </Button>
          </div>

          <div
            className={cn(
              'space-y-4',
              isServerSectionVisible ? 'block' : 'hidden'
            )}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('servers')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                  <div className="p-4 border rounded-lg grid gap-4">
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                        <div className="space-y-2">
                            <FormLabel>{t('subServerName')}</FormLabel>
                            <Input
                                value={subServerFormState.name}
                                onChange={e => handleSubServerInputChange('name', e.target.value)}
                                placeholder={t('subServerNamePlaceholder')}
                            />
                            {subServerErrors.name && <p className="text-sm font-medium text-destructive">{subServerErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                           <FormLabel>{t('subServerType')}</FormLabel>
                            <Input
                                value={subServerFormState.type}
                                onChange={e => handleSubServerInputChange('type', e.target.value)}
                                placeholder={t('subServerTypePlaceholder')}
                            />
                            {subServerErrors.type && <p className="text-sm font-medium text-destructive">{subServerErrors.type}</p>}
                        </div>
                        <div className="space-y-2">
                            <FormLabel>{t('subServerScreens')}</FormLabel>
                            <Input
                                type="number"
                                value={subServerFormState.screens || ''}
                                onChange={e => handleSubServerInputChange('screens', e.target.value === '' ? undefined : Number(e.target.value))}
                                placeholder={t('subServerScreensPlaceholder')}
                            />
                            {subServerErrors.screens && <p className="text-sm font-medium text-destructive">{subServerErrors.screens}</p>}
                        </div>
                        <Button type="button" onClick={handleAddSubServer}>
                            {t('addMoreServers')}
                        </Button>
                    </div>
                     <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                        <div className="space-y-2">
                            <FormLabel>{t('plans')}</FormLabel>
                            <Input
                                value={currentPlanInput}
                                onChange={(e) => setCurrentPlanInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddPlan();
                                  }
                                }}
                                placeholder={t('plansPlaceholder')}
                            />
                            {subServerErrors.plans && <p className="text-sm font-medium text-destructive mt-2">{subServerErrors.plans}</p>}
                        </div>
                        <Button type="button" onClick={handleAddPlan}>
                            {t('addPlan')}
                        </Button>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-2 pt-2">
                        {subServerFormState.plans.map((plan, planIndex) => (
                            <Badge key={planIndex} variant="secondary" className="flex items-center gap-2">
                                {plan}
                                <button type="button" onClick={() => handleRemovePlan(planIndex)} className="rounded-full hover:bg-muted-foreground/20">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                  </div>

                <div className="flex flex-wrap gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative group p-4 border rounded-lg w-full md:w-auto flex-1 min-w-[300px] bg-accent/50">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <h4 className="font-semibold text-lg mb-2">{field.name}</h4>
                        <p className="text-sm text-muted-foreground">{t('subServerType')}: {field.type}</p>
                        <p className="text-sm text-muted-foreground">{t('screens')}: {field.screens}</p>
                        <div className="mt-2">
                            <p className="text-sm font-medium">{t('plans')}:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {field.plans.map((plan, planIndex) => (
                                    <Badge key={planIndex} variant="outline">{plan}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
                
                {fields.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    {t('noSubServers')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit">{server ? t('saveChanges') : t('save')}</Button>
          </div>
        </form>
      </Form>
      
      {serverDataToConfirm && (
        <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={() => setIsConfirmationModalOpen(false)}
            onConfirm={handleConfirmSave}
            serverData={serverDataToConfirm}
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
              {t(server ? 'editServerSuccess' : 'newServerSuccess')}
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
