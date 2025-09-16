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
import { ChevronDown, ChevronUp, PlusCircle, X } from 'lucide-react';
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
import { AddServerModal } from './add-server-modal';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const createSubServerSchema = (t: (key: any) => string) => z.object({
  name: z.string().min(1, t('serverNameRequired')),
  type: z.string().min(1, t('serverTypeRequired')),
  screens: z.coerce
    .number({
        required_error: t('screensRequired'),
        invalid_type_error: t('screensRequired'),
    })
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
      phones: z.array(z.string()).min(1, { message: t('phoneRequired') }),
      paymentType: z.enum(['prepaid', 'postpaid']).default('prepaid'),
      panelValue: z.string().optional(),
      dueDate: z.coerce.number().optional(),
      hasInitialStock: z.boolean().default(false).optional(),
      creditStock: z.coerce.number({invalid_type_error: t('creditStockIsRequired')}).optional(),
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

const initialSubServerValues: SubServerFormValues = {
    name: '',
    type: '',
    screens: undefined as any,
    plans: [],
};

const getInitialValues = (server: Server | null): ServerFormValues => ({
  name: server?.name || '',
  url: server?.url || '',
  login: server?.login || '',
  password: server?.password || '',
  responsibleName: server?.responsibleName || '',
  nickname: server?.nickname || '',
  phones: server?.phones || [],
  paymentType: server?.paymentType || 'prepaid',
  panelValue: server?.panelValue || '',
  dueDate: server?.dueDate || undefined,
  hasInitialStock: !!server?.creditStock,
  creditStock: server?.creditStock || 0,
  subServers: server?.subServers && server.subServers.length > 0 ? server.subServers : [],
});


export function ServerForm({ server }: ServerFormProps) {
  const { t, language } = useLanguage();
  const { addServer, updateServer } = useData();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [serverDataToConfirm, setServerDataToConfirm] = React.useState<ServerFormValues | null>(null);
  const [isAddMoreServerModalOpen, setIsAddMoreServerModalOpen] = React.useState(false);
  const [hasSubmissionError, setHasSubmissionError] = React.useState(false);
  const [noServersAddedError, setNoServersAddedError] = React.useState(false);
  
  const [subServerFormState, setSubServerFormState] = React.useState<SubServerFormValues>(initialSubServerValues);
  const [currentPlanInput, setCurrentPlanInput] = React.useState('');

  const [phoneType, setPhoneType] = React.useState<'celular' | 'fixo' | 'ddi'>('celular');
  const [currentPhone, setCurrentPhone] = React.useState('');
  
  const [subServerErrors, setSubServerErrors] = React.useState<Record<string, string | undefined>>({});
  const [expandedItems, setExpandedItems] = React.useState<Record<number, boolean>>({});
  const [isValidationErrorModalOpen, setIsValidationErrorModalOpen] = React.useState(false);
  const [validationErrorField, setValidationErrorField] = React.useState<string | null>(null);
  const [isMainFormValidationErrorModalOpen, setIsMainFormValidationErrorModalOpen] = React.useState(false);
  const [mainFormErrorFields, setMainFormErrorFields] = React.useState<string[]>([]);
  


  const subServerNameRef = React.useRef<HTMLInputElement>(null);
  const subServerTypeRef = React.useRef<HTMLInputElement>(null);
  const subServerScreensRef = React.useRef<HTMLInputElement>(null);
  const plansInputRef = React.useRef<HTMLInputElement>(null);

  const formSchema = createFormSchema(t);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(server),
    shouldFocusError: false,
  });

  const { control, watch, setValue, reset, formState: { errors }, trigger } = form;
  const paymentType = watch('paymentType');
  const hasInitialStock = watch('hasInitialStock');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subServers',
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phones',
  });
  
  const hasSubServers = fields.length > 0 || subServerFormState.name || subServerFormState.type || subServerFormState.screens || subServerFormState.plans.length > 0 || currentPlanInput.trim() !== '';

  React.useEffect(() => {
    if (hasInitialStock) {
        if (form.getValues('creditStock') === 0) {
            setValue('creditStock', undefined);
        }
    } else {
        setValue('creditStock', 0);
    }
  }, [hasInitialStock, setValue, form]);


  const subServerSchema = createSubServerSchema(t);
  
  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({...prev, [index]: !prev[index]}));
  };
  
  const validateSubServerFields = () => {
    const tempSchema = z.object({
      name: z.string().min(1, t('serverNameRequired')),
      type: z.string().min(1, t('serverTypeRequired')),
      screens: z.coerce
        .number({ required_error: t('screensRequired'), invalid_type_error: t('screensRequired') })
        .min(1, t('screensMin')),
    });
    
    const validationResult = tempSchema.safeParse(subServerFormState);
    
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      const firstErrorIssue = validationResult.error.issues[0];
      const firstErrorField = firstErrorIssue.path[0] as string;
      
      validationResult.error.issues.forEach(issue => {
        newErrors[issue.path[0]] = issue.message;
      });
      
      setSubServerErrors(prev => ({...prev, ...newErrors}));
      setValidationErrorField(firstErrorField);
      setIsValidationErrorModalOpen(true);
      return false;
    }
    setSubServerErrors({});
    return true;
  }

  const handlePlansFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!validateSubServerFields()) {
      e.target.blur();
    }
  }

  const handleAddPlan = () => {
    if (!validateSubServerFields()) {
      return;
    }
    
    const planInput = currentPlanInput.trim();
    if (planInput) {
       setSubServerFormState(prev => ({
        ...prev,
        plans: [...prev.plans, planInput],
      }));
      setCurrentPlanInput('');
      setSubServerErrors(prev => ({ ...prev, plans: undefined }));
    }
  };

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
  
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formattedValue = rawValue;

    if (phoneType === 'celular') {
        formattedValue = rawValue.slice(0, 11);
        if (formattedValue.length > 2) {
            formattedValue = `(${formattedValue.substring(0, 2)}) ${formattedValue.substring(2, 7)}`;
            if (rawValue.length > 7) {
                formattedValue += `-${rawValue.substring(7, 11)}`;
            }
        } else if (rawValue.length > 0) {
            formattedValue = `(${rawValue}`;
        }
    } else if (phoneType === 'fixo') {
        formattedValue = rawValue.slice(0, 10);
        if (rawValue.length > 2) {
            formattedValue = `(${rawValue.substring(0, 2)}) ${rawValue.substring(2, 6)}`;
            if (rawValue.length > 6) {
                formattedValue += `-${rawValue.substring(6, 10)}`;
            }
        } else if (rawValue.length > 0) {
            formattedValue = `(${rawValue}`;
        }
    } else { // ddi
        formattedValue = e.target.value;
    }
    
    setCurrentPhone(formattedValue);
  };
  
  const handleAddPhone = () => {
    if (currentPhone.trim()) {
      appendPhone(currentPhone.trim());
      setCurrentPhone('');
      trigger('phones');
    }
  };

  
  const processSubServerForValidation = () => {
    let formStateWithCurrentPlan = { ...subServerFormState };
    const planInput = currentPlanInput.trim();
    
    if (planInput && !formStateWithCurrentPlan.plans.includes(planInput)) {
        formStateWithCurrentPlan.plans = [...formStateWithCurrentPlan.plans, planInput];
    }
    return formStateWithCurrentPlan;
  }
  
  const handleAddServerClick = () => {
    const subServerToValidate = processSubServerForValidation();
    const result = subServerSchema.safeParse(subServerToValidate);

    if (!result.success) {
        const newErrors: Record<string, string | undefined> = {};
        const firstErrorField = result.error.issues[0].path[0];

        result.error.issues.forEach(issue => {
            newErrors[issue.path[0]] = issue.message;
        });
        setSubServerErrors(newErrors);
        setValidationErrorField(firstErrorField as string);
        setIsValidationErrorModalOpen(true);
        return;
    }

    setSubServerErrors({});
    setIsAddMoreServerModalOpen(true);
  };

  const processAndValidateSubServer = () => {
    const subServerToValidate = processSubServerForValidation();
    
    const isSubServerFormEmpty = Object.values(subServerFormState).every(v => (Array.isArray(v) ? v.length === 0 : !v)) && !currentPlanInput.trim();

    if (isSubServerFormEmpty) {
      return { isValid: true, subServer: null };
    }

    const result = subServerSchema.safeParse(subServerToValidate);

    if (!result.success) {
      setHasSubmissionError(true);
      const firstErrorField = result.error.issues[0].path[0] as string;
      const el = document.getElementsByName(firstErrorField)[0];
      if (el) {
        el.focus();
      }
      toast({
        variant: 'destructive',
        title: t('validationError'),
        description: t('fillAllSubServerFields'),
      });
      return { isValid: false, subServer: null };
    }

    return { isValid: true, subServer: result.data };
  };

  const handleSubmit = (values: ServerFormValues) => {
    const { isValid, subServer } = processAndValidateSubServer();
    if (!isValid) return;

    let finalValues = { ...values };
    if (subServer) {
        finalValues.subServers = [...(values.subServers || []), subServer];
    }
    
    if (!finalValues.subServers || finalValues.subServers.length === 0) {
        setNoServersAddedError(true);
        toast({
            variant: "destructive",
            title: t('validationError'),
            description: t('noSubServers'),
        });
        return;
    }

    setHasSubmissionError(false);
    setNoServersAddedError(false);
    setServerDataToConfirm(finalValues);
    setIsConfirmationModalOpen(true);
  };

  const onInvalid = (errors: any) => {
    const errorKeys = Object.keys(errors);
    setMainFormErrorFields(errorKeys);
    setIsMainFormValidationErrorModalOpen(true);
  };


  const handleConfirmSave = () => {
    if (!serverDataToConfirm) return;
    
    if (server) {
      const serverData: Server = {
          ...server,
          ...serverDataToConfirm,
          id: server.id,
          status: server.status, // Keep original status, it's changed in modal
          subServers: serverDataToConfirm.subServers || [],
      };
      updateServer(serverData);
    } else {
        const serverData: Omit<Server, 'id' | 'status'> = {
            ...serverDataToConfirm,
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
      setSubServerFormState(initialSubServerValues);
      setCurrentPlanInput('');
      remove();
    }
  };

   const handleAddMoreResponse = (addMore: boolean) => {
    setIsAddMoreServerModalOpen(false);
    const subServerToValidate = processSubServerForValidation();
    const result = subServerSchema.safeParse(subServerToValidate);

    if (result.success) {
        append(result.data);
        setSubServerFormState(initialSubServerValues);
        setCurrentPlanInput('');
        setNoServersAddedError(false);
        if (addMore) {
           // Form is cleared, ready for the next one
           const firstSubServerField = document.getElementsByName("name")[1];
           if(firstSubServerField) firstSubServerField.focus();
        } else {
            // User doesn't want to add more, they will click save next.
            const saveButton = document.getElementById('main-save-button');
            saveButton?.focus();
        }
    } else {
      const firstErrorField = result.error.issues[0].path[0] as string;
      const el = document.getElementsByName(firstErrorField)[0];
      if (el) {
        el.focus();
      }
    }
  };

  const handleValidationModalClose = () => {
    setIsValidationErrorModalOpen(false);
    const refs: { [key: string]: React.RefObject<HTMLInputElement> } = {
        name: subServerNameRef,
        type: subServerTypeRef,
        screens: subServerScreensRef,
    };

    if (validationErrorField) {
        const fieldRef = refs[validationErrorField];
        if (fieldRef?.current) {
            fieldRef.current.focus();
            fieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    setValidationErrorField(null);
  }

  const handleMainFormValidationModalClose = () => {
    setIsMainFormValidationErrorModalOpen(false);
    if (mainFormErrorFields.length > 0) {
      const firstErrorField = mainFormErrorFields[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setMainFormErrorFields([]);
  };

  const phonePlaceholders = {
      celular: 'Ex: (11) 91234-5678',
      fixo: 'Ex: (11) 3456-7890',
      ddi: 'Ex: +44 20 7946 0958'
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('serverName')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
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
                        autoComplete="off"
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
                      <Input autoComplete="username" {...field} placeholder={t('loginPlaceholder')} />
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
                        autoComplete="current-password"
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
                        autoComplete="off"
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
                      <Input autoComplete="off" placeholder={t('nicknamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <FormField
                control={form.control}
                name="phones"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <RadioGroup
                      value={phoneType}
                      onValueChange={(value) => setPhoneType(value as any)}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="celular" />
                        </FormControl>
                        <FormLabel className="font-normal">Celular</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fixo" />
                        </FormControl>
                        <FormLabel className="font-normal">Fixo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ddi" />
                        </FormControl>
                        .
                        <FormLabel className="font-normal">DDI</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <div className="flex gap-2">
                      <Input
                        value={currentPhone}
                        onChange={handlePhoneInputChange}
                        placeholder={phonePlaceholders[phoneType]}
                      />
                      <Button type="button" onClick={handleAddPhone}>
                        {t('add')}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {phoneFields.map((field, index) => (
                  <Badge
                    key={field.id}
                    variant="secondary"
                    className="flex items-center gap-2 text-base"
                  >
                    {field.value}
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
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
                          autoComplete="off"
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
                          autoComplete="off"
                          {...field}
                          disabled={!hasInitialStock}
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
          
          <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('servers')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="p-4 border rounded-lg grid gap-4 bg-accent/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <FormItem>
                                <FormLabel>{t('subServerName')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        ref={subServerNameRef}
                                        name="name"
                                        autoComplete="off"
                                        value={subServerFormState.name}
                                        onChange={e => {
                                            setSubServerFormState(p => ({ ...p, name: e.target.value }));
                                            setSubServerErrors(p => ({...p, name: undefined}));
                                        }}
                                        placeholder={t('subServerNamePlaceholder')} 
                                    />
                                </FormControl>
                                {subServerErrors.name && <p className="text-sm font-medium text-destructive">{subServerErrors.name}</p>}
                            </FormItem>
                            <FormItem>
                                <FormLabel>{t('subServerType')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        ref={subServerTypeRef}
                                        name="type"
                                        autoComplete="off"
                                        value={subServerFormState.type}
                                        onChange={e => {
                                            setSubServerFormState(p => ({ ...p, type: e.target.value }));
                                            setSubServerErrors(p => ({...p, type: undefined}));
                                        }}
                                        placeholder={t('subServerTypePlaceholder')} 
                                    />
                                </FormControl>
                                 {subServerErrors.type && <p className="text-sm font-medium text-destructive">{subServerErrors.type}</p>}
                            </FormItem>
                             <FormItem>
                                <FormLabel>{t('subServerScreens')}</FormLabel>
                                <FormControl>
                                    <Input
                                        ref={subServerScreensRef}
                                        type="number"
                                        name="screens"
                                        autoComplete="off"
                                        value={subServerFormState.screens || ''}
                                        onChange={e => {
                                            setSubServerFormState(p => ({ ...p, screens: e.target.value === '' ? undefined : Number(e.target.value) }));
                                            setSubServerErrors(p => ({...p, screens: undefined}));
                                        }}
                                        placeholder={t('subServerScreensPlaceholder')}
                                    />
                                </FormControl>
                                 {subServerErrors.screens && <p className="text-sm font-medium text-destructive">{subServerErrors.screens}</p>}
                            </FormItem>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                             <FormItem>
                                <FormLabel>{t('plans')}</FormLabel>
                                <FormControl>
                                    <Input
                                        ref={plansInputRef}
                                        name="plans"
                                        autoComplete="off"
                                        value={currentPlanInput}
                                        onFocus={handlePlansFocus}
                                        onChange={(e) => setCurrentPlanInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddPlan();
                                            }
                                        }}
                                        placeholder={t('plansPlaceholder')}
                                    />
                                </FormControl>
                                {subServerErrors.plans && <p className="text-sm font-medium text-destructive">{subServerErrors.plans}</p>}
                            </FormItem>
                             <Button type="button" onClick={handleAddPlan} variant="default">
                                {t('addPlan')}
                            </Button>
                            <Button type="button" onClick={handleAddServerClick} variant="default">
                                {t('addServer')}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                         {fields.map((field, index) => (
                            <Collapsible key={field.id} open={expandedItems[index] !== false} onOpenChange={() => toggleExpand(index)} asChild>
                                <div className="p-4 border rounded-lg bg-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{field.name} ({field.type})</p>
                                            <p className="text-sm text-muted-foreground">{t('screens')}: {field.screens}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground"
                                                >
                                                    {expandedItems[index] !== false ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                    <span className="sr-only">{expandedItems[index] !== false ? t('collapse') : t('expand')}</span>
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {field.plans.map((plan, planIndex) => (
                                                <Badge key={planIndex} variant="outline">{plan}</Badge>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        ))}
                    </div>
                
                    {fields.length === 0 && (
                        <div className={cn("text-center py-4", noServersAddedError ? "text-destructive" : "text-muted-foreground")}>
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
              <Button id="main-save-button" type="submit">
                  {server ? t('saveChanges') : t('save')}
              </Button>
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

      <AddServerModal
        isOpen={isAddMoreServerModalOpen}
        onResponse={handleAddMoreResponse}
      />

      <AlertDialog open={isValidationErrorModalOpen} onOpenChange={setIsValidationErrorModalOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('validationError')}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {t('fillAllFieldsWarning')}: {
                        Object.entries(subServerErrors)
                            .filter(([, message]) => message)
                            .map(([field]) => t(
                                field === 'name' ? 'subServerName' : 
                                field === 'type' ? 'subServerType' : 
                                'subServerScreens'
                            )).join(', ')
                      }
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction onClick={handleValidationModalClose}>
                  {t('ok')}
              </AlertDialogAction>
          </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={isMainFormValidationErrorModalOpen} onOpenChange={setIsMainFormValidationErrorModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('validationError')}</AlertDialogTitle>

                <AlertDialogDescription>
                    {t('fillAllFieldsWarning')}: {mainFormErrorFields.map(field => t(field as any)).join(', ')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={handleMainFormValidationModalClose}>
                {t('ok')}
            </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>


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

    