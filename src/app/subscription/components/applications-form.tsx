'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import type { Application, Client } from '@/lib/types';
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
import { ChevronDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BirthdateInput } from '@/components/ui/birthdate-input';

interface ApplicationsFormProps {
  selectedClient: Client | null;
  onUpdateClient: (client: Client) => void;
}

const initialAppState: Application = {
  name: '',
  macAddress: '',
  keyId: '',
  licenseType: 'Free',
  licenseDueDate: '',
  device: '',
  location: '',
};

export function ApplicationsForm({
  selectedClient,
  onUpdateClient,
}: ApplicationsFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [currentApp, setCurrentApp] = React.useState(initialAppState);

  React.useEffect(() => {
    if (selectedClient) {
      setApplications(selectedClient.applications || []);
    } else {
      setApplications([]);
      setCurrentApp(initialAppState);
    }
  }, [selectedClient]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field?: keyof Application
  ) => {
    const name = field || e.target.name;
    const value = e.target.value;
    setCurrentApp((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: string) => {
    setCurrentApp((prev) => ({...prev, licenseDueDate: value}));
  }

  const handleLicenseTypeChange = (checked: boolean) => {
    const newLicenseType = checked ? 'Anual' : 'Free';
    setCurrentApp((prev) => ({
      ...prev,
      licenseType: newLicenseType,
      licenseDueDate: newLicenseType === 'Free' ? '' : prev.licenseDueDate,
    }));
  };

  const handleAddApplication = () => {
    if (!currentApp.name) {
      toast({
        title: t('validationError'),
        description: t('appNameRequired'),
        variant: 'destructive',
      });
      return;
    }
    const newApp: Application = { ...currentApp };
    const updatedApps = [...applications, newApp];
    setApplications(updatedApps);

    if (selectedClient) {
      const updatedClient = { ...selectedClient, applications: updatedApps };
      onUpdateClient(updatedClient);
    }
    setCurrentApp(initialAppState);
  };

  const handleRemoveApplication = (indexToRemove: number) => {
    const updatedApps = applications.filter(
      (_, index) => index !== indexToRemove
    );
    setApplications(updatedApps);
    if (selectedClient) {
      const updatedClient = { ...selectedClient, applications: updatedApps };
      onUpdateClient(updatedClient);
    }
  };

  const birthdateField = {
    value: currentApp.licenseDueDate,
    onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            handleDateChange(e);
        } else {
            handleDateChange(e.target.value);
        }
    },
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">{t('appName')}</Label>
              <Input
                id="app-name"
                name="name"
                value={currentApp.name}
                onChange={handleInputChange}
                placeholder={t('appNamePlaceholder')}
                disabled={!selectedClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mac-address">{t('macAddress')}</Label>
              <Input
                id="mac-address"
                name="macAddress"
                value={currentApp.macAddress}
                onChange={handleInputChange}
                placeholder="00:00:00:00:00:00"
                disabled={!selectedClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-id">{t('keyId')}</Label>
              <Input
                id="key-id"
                name="keyId"
                value={currentApp.keyId}
                onChange={handleInputChange}
                disabled={!selectedClient}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('licenseType')}</Label>
              <div className="flex items-center space-x-4 rounded-md border p-3 h-11 bg-background">
                <Label
                  htmlFor="license-type-switch"
                  className="cursor-pointer"
                >
                  {t('free')}
                </Label>
                <Switch
                  id="license-type-switch"
                  checked={currentApp.licenseType === 'Anual'}
                  onCheckedChange={handleLicenseTypeChange}
                  disabled={!selectedClient}
                />
                <Label
                  htmlFor="license-type-switch"
                  className="cursor-pointer"
                >
                  {t('anual')}
                </Label>
              </div>
            </div>
            {currentApp.licenseType === 'Anual' && (
              <div className="space-y-2">
                <Label htmlFor="license-due-date">{t('licenseDueDate')}</Label>
                <BirthdateInput field={birthdateField} language={language} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="device">{t('device')}</Label>
              <Input
                id="device"
                name="device"
                value={currentApp.device}
                onChange={handleInputChange}
                placeholder={t('devicePlaceholder')}
                disabled={!selectedClient}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                name="location"
                value={currentApp.location}
                onChange={handleInputChange}
                placeholder={t('locationPlaceholder')}
                disabled={!selectedClient}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAddApplication}
              disabled={!selectedClient || !currentApp.name}
            >
              {t('addApplication')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {applications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('addedApplications')}</h3>
          {applications.map((app, index) => (
            <Collapsible key={index} asChild>
              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-4 cursor-pointer flex-1">
                      <CardTitle className="text-base">{app.name}</CardTitle>
                      <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveApplication(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="text-sm text-muted-foreground space-y-3 pt-0 pb-4">
                    <p>
                      <span className="font-semibold">{t('macAddress')}:</span>{' '}
                      {app.macAddress}
                    </p>
                    <p>
                      <span className="font-semibold">{t('keyId')}:</span>{' '}
                      {app.keyId}
                    </p>
                    <p>
                      <span className="font-semibold">{t('device')}:</span>{' '}
                      {app.device}
                    </p>
                    <p>
                      <span className="font-semibold">{t('location')}:</span>{' '}
                      {app.location}
                    </p>
                    <p>
                      <span className="font-semibold">{t('licenseType')}:</span>{' '}
                      {t((app.licenseType || 'free').toLowerCase() as any)}
                    </p>
                     {app.licenseType === 'Anual' && app.licenseDueDate && (
                       <p>
                          <span className="font-semibold">{t('licenseDueDate')}:</span>{' '}
                          {app.licenseDueDate}
                       </p>
                     )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
