'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: 'pt-BR' | 'en-US') => {
    setLanguage(lang);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="space-y-10">
        <Card>
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">{t('appearance')}</CardTitle>
            <CardDescription className="text-lg">
              {t('appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8 pt-0">
            <div className="space-y-4">
              <Label className="text-lg">{t('theme')}</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                      'hover:text-primary hover:border-primary/50',
                      'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8"
                    >
                      <path d="M12 8a4 4 0 1 0 4 4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    {t('light')}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="dark"
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                      'hover:text-primary hover:border-primary/50',
                      'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    {t('dark')}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="system"
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent p-4 text-base font-semibold transition-all cursor-pointer',
                      'hover:text-primary hover:border-primary/50',
                      'peer-data-[state=checked]:text-primary peer-data-[state=checked]:border-primary'
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8"
                    >
                      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" />
                      <path d="M12 2a10 10 0 1 0 10 10" />
                    </svg>
                    {t('system')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-lg">{t('language')}</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="pt-br"
                    checked={language === 'pt-BR'}
                    onCheckedChange={() => handleLanguageChange('pt-BR')}
                  />
                  <Label htmlFor="pt-br" className="text-base cursor-pointer">
                    Português (Brasil)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="en-us"
                    checked={language === 'en-US'}
                    onCheckedChange={() => handleLanguageChange('en-US')}
                  />
                  <Label htmlFor="en-us" className="text-base cursor-pointer">
                    English
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">{t('notifications')}</CardTitle>
            <CardDescription className="text-lg">
              {t('notificationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0">
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div className="space-y-1">
                <Label
                  htmlFor="server-offline"
                  className="text-lg cursor-pointer"
                >
                  {t('serverOfflineAlerts')}
                </Label>
                <p className="text-base text-muted-foreground">
                  {t('serverOfflineAlertsDescription')}
                </p>
              </div>
              <Switch id="server-offline" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div className="space-y-1">
                <Label
                  htmlFor="client-expiry"
                  className="text-lg cursor-pointer"
                >
                  {t('clientExpiryWarnings')}
                </Label>
                <p className="text-base text-muted-foreground">
                  {t('clientExpiryWarningsDescription')}
                </p>
              </div>
              <Switch id="client-expiry" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div className="space-y-1">
                <Label
                  htmlFor="weekly-summary"
                  className="text-lg cursor-pointer"
                >
                  {t('weeklySummary')}
                </Label>
                <p className="text-base text-muted-foreground">
                  {t('weeklySummaryDescription')}
                </p>
              </div>
              <Switch id="weekly-summary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg">{t('savePreferences')}</Button>
      </div>
    </div>
  );
}
