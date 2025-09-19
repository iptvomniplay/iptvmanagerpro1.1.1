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
import { ChevronDown, PlusCircle, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BirthdateInput } from '@/components/ui/birthdate-input';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInputModal } from '@/components/ui/phone-input-modal';

interface ApplicationsFormProps {
  selectedClient: Client | null;
  onUpdateClient: (client: Client) => void;
  addedPlans: SelectedPlan[];
}

const initialAppState: Application = {
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

export function ApplicationsForm({
  selectedClient,
  onUpdateClient,
  addedPlans,
}: ApplicationsFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [phoneModalState, setPhoneModalState] = React.useState<{isOpen: boolean; index: number | null}>({isOpen: false, index: null});

  React.useEffect(() => {
    if (selectedClient) {
      setApplications(selectedClient.applications || []);
    } else {
      setApplications([]);
    }
  }, [selectedClient]);

  const handleAppChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof Application
  ) => {
    const { value } = e.target;
    const newApps = [...applications];
    newApps[index] = { ...newApps[index], [field]: value };
    setApplications(newApps);
  };

  const handleCheckboxChange = (
    checked: boolean,
    index: number,
    field: keyof Application
  ) => {
    const newApps = [...applications];
    newApps[index] = { ...newApps[index], [field]: checked };
    if (field === 'hasResponsible' && !checked) {
      newApps[index].responsibleName = '';
      newApps[index].responsiblePhones = [];
    }
    setApplications(newApps);
  };

  const handleDateChange = (value: string, index: number) => {
     const newApps = [...applications];
    newApps[index] = { ...newApps[index], licenseDueDate: value };
    setApplications(newApps);
  }

  const handleLicenseTypeChange = (checked: boolean, index: number) => {
    const newLicenseType = checked ? 'Anual' : 'Free';
    const newApps = [...applications];
    newApps[index] = {
      ...newApps[index],
      licenseType: newLicenseType,
      licenseDueDate: newLicenseType === 'Free' ? '' : newApps[index].licenseDueDate,
    };
    setApplications(newApps);
  };

  const handlePhoneSave = (newPhones: Phone[]) => {
    if (phoneModalState.index !== null) {
      const newApps = [...applications];
      newApps[phoneModalState.index] = { ...newApps[phoneModalState.index], responsiblePhones: newPhones };
      setApplications(newApps);
    }
    setPhoneModalState({isOpen: false, index: null});
  }

  const handleAddApplication = () => {
    setApplications(prev => [...prev, initialAppState]);
  };
  
  const handleRemoveApplication = (indexToRemove: number) => {
    const newApps = applications.filter((_, index) => index !== indexToRemove);
    setApplications(newApps);
  };

  const handleSaveApplications = () => {
    if (selectedClient) {
      const updatedClient = { ...selectedClient, applications };
      onUpdateClient(updatedClient);
      toast({
        title: t('registrationAddedSuccess'),
        description: `As aplicações do cliente ${selectedClient.name} foram salvas.`,
      });
    }
  };
  
  const totalScreensFromPlans = addedPlans.reduce((sum, plan) => sum + plan.screens, 0);

  if (!selectedClient || addedPlans.length === 0) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">{t('noScreensOrClient')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {applications.map((app, index) => (
          <Collapsible key={index} asChild defaultOpen>
            <Card className="bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                 <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-4 cursor-pointer flex-1">
                      <CardTitle className="text-base">{app.name || `${t('applications')} ${index + 1}`}</CardTitle>
                      <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-0 data-[state=closed]:-rotate-90" />
                    </div>
                  </CollapsibleTrigger>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveApplication(index)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`app-name-${index}`}>{t('appName')}</Label>
                      <Input
                        id={`app-name-${index}`}
                        value={app.name}
                        onChange={(e) => handleAppChange(e, index, 'name')}
                        placeholder={t('appNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`mac-address-${index}`}>{t('macAddress')}</Label>
                      <Input
                        id={`mac-address-${index}`}
                        value={app.macAddress}
                        onChange={(e) => handleAppChange(e, index, 'macAddress')}
                        placeholder="00:00:00:00:00:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`key-id-${index}`}>{t('keyId')}</Label>
                      <Input
                        id={`key-id-${index}`}
                        value={app.keyId}
                        onChange={(e) => handleAppChange(e, index, 'keyId')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('licenseType')}</Label>
                      <div className="flex items-center space-x-4 rounded-md border p-3 h-11 bg-background">
                        <Label
                          htmlFor={`license-type-switch-${index}`}
                          className="cursor-pointer"
                        >
                          {t('free')}
                        </Label>
                        <Switch
                          id={`license-type-switch-${index}`}
                          checked={app.licenseType === 'Anual'}
                          onCheckedChange={(checked) => handleLicenseTypeChange(checked, index)}
                        />
                        <Label
                          htmlFor={`license-type-switch-${index}`}
                          className="cursor-pointer"
                        >
                          {t('anual')}
                        </Label>
                      </div>
                    </div>
                    
                    {app.licenseType === 'Anual' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`license-due-date-${index}`}>{t('licenseDueDate')}</Label>
                          <BirthdateInput 
                            field={{
                                value: app.licenseDueDate,
                                onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
                                    const value = typeof e === 'string' ? e : e.target.value;
                                    handleDateChange(value, index);
                                }
                            }}
                            language={language} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`activation-location-${index}`}>{t('activationLocation')}</Label>
                          <Input
                            id={`activation-location-${index}`}
                            value={app.activationLocation || ''}
                            onChange={(e) => handleAppChange(e, index, 'activationLocation')}
                          />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                           <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`has-responsible-${index}`}
                                checked={app.hasResponsible} 
                                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, index, 'hasResponsible')}
                              />
                              <Label htmlFor={`has-responsible-${index}`} className="cursor-pointer">{t('responsibleAndPhone')}</Label>
                           </div>
                        </div>

                        {app.hasResponsible && (
                          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                              <Label htmlFor={`responsible-name-${index}`}>{t('responsibleName')}</Label>
                              <Input
                                id={`responsible-name-${index}`}
                                value={app.responsibleName || ''}
                                onChange={(e) => handleAppChange(e, index, 'responsibleName')}
                              />
                            </div>
                             <div className="space-y-2">
                                <Button
                                  type="button"
                                  variant="default"
                                  onClick={() => setPhoneModalState({ isOpen: true, index })}
                                  className="w-full"
                                >
                                  {app.responsiblePhones && app.responsiblePhones.length > 0 ? t('managePhones') : t('addPhone')}
                                </Button>
                            </div>
                          </div>
                        )}

                         <div className="space-y-2">
                          <Label htmlFor={`activation-id-${index}`}>{t('activationId')}</Label>
                          <Input
                            id={`activation-id-${index}`}
                            value={app.activationId || ''}
                            onChange={(e) => handleAppChange(e, index, 'activationId')}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`device-${index}`}>{t('device')}</Label>
                      <Input
                        id={`device-${index}`}
                        value={app.device}
                        onChange={(e) => handleAppChange(e, index, 'device')}
                        placeholder={t('devicePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-${index}`}>{t('location')}</Label>
                      <Input
                        id={`location-${index}`}
                        value={app.location}
                        onChange={(e) => handleAppChange(e, index, 'location')}
                        placeholder={t('locationPlaceholder')}
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        
        {applications.length < totalScreensFromPlans && (
            <Button onClick={handleAddApplication} variant="outline" className="w-full border-dashed">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addApplication')}
            </Button>
        )}
        
        <div className="flex justify-end pt-4">
            <Button onClick={handleSaveApplications}>
                {t('save')}
            </Button>
        </div>
      </div>

      {phoneModalState.isOpen && phoneModalState.index !== null && (
        <PhoneInputModal
            isOpen={phoneModalState.isOpen}
            onClose={() => setPhoneModalState({isOpen: false, index: null})}
            onSave={handlePhoneSave}
            initialPhones={applications[phoneModalState.index]?.responsiblePhones || []}
        />
      )}
    </>
  );
}
