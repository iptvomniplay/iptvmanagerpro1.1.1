'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import type { Application, Client, Phone, SelectedPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, PlusCircle } from 'lucide-react';
import { BirthdateInput } from '@/components/ui/birthdate-input';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInputModal } from '@/components/ui/phone-input-modal';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';


interface ApplicationsFormProps {
  selectedClient: Client | null;
  onUpdateApplications: (applications: Application[]) => void;
}

const initialAppState: Omit<Application, 'planId' | 'screenNumber'> = {
  name: '',
  macAddress: '',
  keyId: '',
  licenseType: 'Free',
  licenseDueDate: '',
  device: '',
  location: '',
  activationLocation: '',
  hasResponsible: false,
  responsibleName: '',
  responsiblePhones: [],
  activationId: '',
};

type ApplicationSlot = {
  planId: string;
  screenNumber: number;
  data: Application;
  status: 'pending' | 'complete';
};

export function ApplicationsForm({
  selectedClient,
  onUpdateApplications,
}: ApplicationsFormProps) {
  const { t, language } = useLanguage();
  const [appSlots, setAppSlots] = React.useState<ApplicationSlot[]>([]);
  const [openSlots, setOpenSlots] = React.useState<Record<string, boolean>>({});
  const [phoneModalState, setPhoneModalState] = React.useState<{isOpen: boolean; slotKey: string | null}>({isOpen: false, slotKey: null});
  const [isLimitModalOpen, setIsLimitModalOpen] = React.useState(false);

  const addedPlans = selectedClient?.plans || [];
  const totalScreensFromPlans = React.useMemo(() => addedPlans.reduce((sum, plan) => sum + plan.screens, 0), [addedPlans]);

  React.useEffect(() => {
    const generateSlots = () => {
      const newSlots: ApplicationSlot[] = [];
      addedPlans.forEach(plan => {
        for (let i = 1; i <= plan.screens; i++) {
          const planId = `${plan.panel.id}-${plan.server.name}-${plan.plan.name}`;
          const existingApp = selectedClient?.applications?.find(
            app => app.planId === planId && app.screenNumber === i
          );
          newSlots.push({
            planId: planId,
            screenNumber: i,
            data: existingApp || { ...initialAppState, planId, screenNumber: i },
            status: existingApp ? 'complete' : 'pending',
          });
        }
      });
      return newSlots;
    };

    if (selectedClient) {
      const slots = generateSlots();
      setAppSlots(slots);
      
      const initialOpenState: Record<string, boolean> = {};
      const firstPending = slots.find(s => s.status === 'pending');
      if (firstPending) {
        initialOpenState[`${firstPending.planId}-${firstPending.screenNumber}`] = true;
      }
      setOpenSlots(initialOpenState);
    } else {
      setAppSlots([]);
      setOpenSlots({});
    }
  }, [selectedClient, addedPlans]);

  const updateClientApplications = React.useCallback((updatedSlots: ApplicationSlot[]) => {
      const completedApplications = updatedSlots
        .filter(slot => slot.status === 'complete')
        .map(slot => slot.data);
      onUpdateApplications(completedApplications);
  }, [onUpdateApplications]);


  const handleSlotChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotKey: string,
    field: keyof Application
  ) => {
    const { value } = e.target;
    setAppSlots(prevSlots =>
      prevSlots.map(slot =>
        `${slot.planId}-${slot.screenNumber}` === slotKey
          ? { ...slot, data: { ...slot.data, [field]: value } }
          : slot
      )
    );
  };

  const handleCheckboxChange = (
    checked: boolean,
    slotKey: string,
    field: keyof Application
  ) => {
    setAppSlots(prevSlots =>
      prevSlots.map(slot => {
        if (`${slot.planId}-${slot.screenNumber}` === slotKey) {
          const updatedData = { ...slot.data, [field]: checked };
          if (field === 'hasResponsible' && !checked) {
            updatedData.responsibleName = '';
            updatedData.responsiblePhones = [];
          }
          return { ...slot, data: updatedData };
        }
        return slot;
      })
    );
  };
  
  const handleDateChange = (value: string, slotKey: string) => {
     setAppSlots(prevSlots =>
      prevSlots.map(slot =>
        `${slot.planId}-${slot.screenNumber}` === slotKey
          ? { ...slot, data: { ...slot.data, licenseDueDate: value } }
          : slot
      )
    );
  }

  const handleLicenseTypeChange = (checked: boolean, slotKey: string) => {
    const newLicenseType = checked ? 'Anual' : 'Free';
    setAppSlots(prevSlots =>
      prevSlots.map(slot => {
        if (`${slot.planId}-${slot.screenNumber}` === slotKey) {
          const updatedData = { ...slot.data, licenseType: newLicenseType };
           if (newLicenseType === 'Free') {
            updatedData.licenseDueDate = '';
          }
          return { ...slot, data: updatedData };
        }
        return slot;
      })
    );
  };

  const handlePhoneSave = (newPhones: Phone[]) => {
    if (phoneModalState.slotKey !== null) {
      setAppSlots(prevSlots =>
        prevSlots.map(slot =>
          `${slot.planId}-${slot.screenNumber}` === phoneModalState.slotKey
            ? { ...slot, data: { ...slot.data, responsiblePhones: newPhones } }
            : slot
        )
      );
    }
    setPhoneModalState({isOpen: false, slotKey: null});
  }

  const findNextPendingSlotIndex = () => {
    return appSlots.findIndex(slot => slot.status === 'pending');
  };

  const handleAddApplication = () => {
    const nextPendingIndex = findNextPendingSlotIndex();
    if (nextPendingIndex !== -1) {
      const nextSlot = appSlots[nextPendingIndex];
      const slotKey = `${nextSlot.planId}-${nextSlot.screenNumber}`;
      setOpenSlots(prev => ({...prev, [slotKey]: true}));
       // Focus on the first input of the opened slot
      setTimeout(() => {
        const input = document.getElementById(`app-name-${slotKey}`);
        input?.focus();
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setIsLimitModalOpen(true);
    }
  };
  
  const handleConfirmSlot = (slotKey: string, currentIndex: number) => {
    const newAppSlots = appSlots.map(slot =>
      `${slot.planId}-${slot.screenNumber}` === slotKey
        ? { ...slot, status: 'complete' as const }
        : slot
    );
    setAppSlots(newAppSlots);
    setOpenSlots(prev => ({...prev, [slotKey]: false}));
    
    updateClientApplications(newAppSlots);
    
    // Find and open the next pending slot
    const nextPendingIndex = newAppSlots.findIndex((slot, index) => index > currentIndex && slot.status === 'pending');
    if (nextPendingIndex !== -1) {
        const nextSlot = newAppSlots[nextPendingIndex];
        const nextSlotKey = `${nextSlot.planId}-${nextSlot.screenNumber}`;
        setOpenSlots(prev => ({...prev, [nextSlotKey]: true}));
    }
  };
  
  const pendingSlotsCount = appSlots.filter(s => s.status === 'pending').length;

  if (!selectedClient || addedPlans.length === 0) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">{t('noScreensOrClient')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-center font-semibold text-base">
              {t('O cliente')} {selectedClient.name} {t('possui')} {totalScreensFromPlans} {t('telas contratadas. Adicione os dados de cada tela antes de prosseguir.')}
          </p>
      </div>

      <div className="space-y-6">
        {appSlots.map((slot, index) => {
          const slotKey = `${slot.planId}-${slot.screenNumber}`;
          const planInfo = addedPlans.find(p => `${p.panel.id}-${p.server.name}-${p.plan.name}` === slot.planId);
          
          return (
          <Collapsible key={slotKey} asChild open={openSlots[slotKey]} onOpenChange={(isOpen) => setOpenSlots(p => ({...p, [slotKey]: isOpen}))}>
            <Card className={cn("bg-muted/20", slot.status === 'complete' && 'border-green-500/50')}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between py-4 px-6 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-base">{`Tela ${index + 1}`}{planInfo ? ` (${planInfo.plan.name})` : ''}</CardTitle>
                        <Badge variant={slot.status === 'complete' ? 'success' : 'secondary'}>
                            {slot.status === 'complete' ? 'Completo' : 'Pendente'}
                        </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-0 data-[state=closed]:-rotate-90" />
                        <span className="sr-only">{t('expand')}</span>
                    </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`app-name-${slotKey}`}>{t('appName')}</Label>
                      <Input
                        id={`app-name-${slotKey}`}
                        value={slot.data.name}
                        onChange={(e) => handleSlotChange(e, slotKey, 'name')}
                        placeholder={t('appNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`mac-address-${slotKey}`}>{t('macAddress')}</Label>
                      <Input
                        id={`mac-address-${slotKey}`}
                        value={slot.data.macAddress}
                        onChange={(e) => handleSlotChange(e, slotKey, 'macAddress')}
                        placeholder="00:00:00:00:00:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`key-id-${slotKey}`}>{t('keyId')}</Label>
                      <Input
                        id={`key-id-${slotKey}`}
                        value={slot.data.keyId}
                        onChange={(e) => handleSlotChange(e, slotKey, 'keyId')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('licenseType')}</Label>
                      <div className="flex items-center space-x-4 rounded-md border p-3 h-11 bg-background">
                        <Label
                          htmlFor={`license-type-switch-${slotKey}`}
                          className="cursor-pointer"
                        >
                          {t('free')}
                        </Label>
                        <Switch
                          id={`license-type-switch-${slotKey}`}
                          checked={slot.data.licenseType === 'Anual'}
                          onCheckedChange={(checked) => handleLicenseTypeChange(checked, slotKey)}
                        />
                        <Label
                          htmlFor={`license-type-switch-${slotKey}`}
                          className="cursor-pointer"
                        >
                          {t('anual')}
                        </Label>
                      </div>
                    </div>
                    
                    {slot.data.licenseType === 'Anual' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`license-due-date-${slotKey}`}>{t('licenseDueDate')}</Label>
                          <BirthdateInput 
                            field={{
                                value: slot.data.licenseDueDate,
                                onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
                                    const value = typeof e === 'string' ? e : e.target.value;
                                    handleDateChange(value, slotKey);
                                }
                            }}
                            language={language} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`activation-location-${slotKey}`}>{t('activationLocation')}</Label>
                          <Input
                            id={`activation-location-${slotKey}`}
                            value={slot.data.activationLocation || ''}
                            onChange={(e) => handleSlotChange(e, slotKey, 'activationLocation')}
                          />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`has-responsible-${slotKey}`}
                                checked={!!slot.data.hasResponsible}
                                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, slotKey, 'hasResponsible')}
                              />
                              <Label htmlFor={`has-responsible-${slotKey}`} className="cursor-pointer">{t('responsibleAndPhone')}</Label>
                           </div>
                        </div>

                        {slot.data.hasResponsible && (
                          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                              <Label htmlFor={`responsible-name-${slotKey}`}>{t('responsibleName')}</Label>
                              <Input
                                id={`responsible-name-${slotKey}`}
                                value={slot.data.responsibleName || ''}
                                onChange={(e) => handleSlotChange(e, slotKey, 'responsibleName')}
                              />
                            </div>
                             <div className="space-y-2">
                                <Button
                                  type="button"
                                  variant="default"
                                  onClick={() => setPhoneModalState({ isOpen: true, slotKey })}
                                  className="w-full"
                                >
                                  {slot.data.responsiblePhones && slot.data.responsiblePhones.length > 0 ? t('managePhones') : t('addPhone')}
                                </Button>
                            </div>
                          </div>
                        )}

                         <div className="space-y-2">
                          <Label htmlFor={`activation-id-${slotKey}`}>{t('activationId')}</Label>
                          <Input
                            id={`activation-id-${slotKey}`}
                            value={slot.data.activationId || ''}
                            onChange={(e) => handleSlotChange(e, slotKey, 'activationId')}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`device-${slotKey}`}>{t('device')}</Label>
                      <Input
                        id={`device-${slotKey}`}
                        value={slot.data.device}
                        onChange={(e) => handleSlotChange(e, slotKey, 'device')}
                        placeholder={t('devicePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-${slotKey}`}>{t('location')}</Label>
                      <Input
                        id={`location-${slotKey}`}
                        value={slot.data.location}
                        onChange={(e) => handleSlotChange(e, slotKey, 'location')}
                        placeholder={t('locationPlaceholder')}
                      />
                    </div>
                  </div>
                   <div className="flex justify-end pt-4">
                        <Button onClick={() => handleConfirmSlot(slotKey, index)}>
                            Confirmar
                        </Button>
                    </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )})}
        
        {pendingSlotsCount > 0 && (
          <div className="flex justify-center pt-4">
              <Button onClick={handleAddApplication} variant="default" className={cn("w-full", pendingSlotsCount > 0 && "animate-flash")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('addApplication')} ({t('faltam')} {pendingSlotsCount})
              </Button>
          </div>
        )}
      </div>

      {phoneModalState.isOpen && phoneModalState.slotKey !== null && (
        <PhoneInputModal
            isOpen={phoneModalState.isOpen}
            onClose={() => setPhoneModalState({isOpen: false, slotKey: null})}
            onSave={handlePhoneSave}
            initialPhones={appSlots.find(s => `${s.planId}-${s.screenNumber}` === phoneModalState.slotKey)?.data.responsiblePhones || []}
        />
      )}

      <AlertDialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('limitReached')}</AlertDialogTitle>
                <AlertDialogDescription>{t('allScreensFilled')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setIsLimitModalOpen(false)}>
                {t('ok')}
            </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
