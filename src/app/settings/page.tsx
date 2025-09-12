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
import { Monitor, MoonStar, SunDim } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">{t('appearance')}</CardTitle>
            <CardDescription className="text-lg">
              {t('appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 p-8 pt-0">
            <div className="space-y-4">
              <Label className="text-lg">{t('theme')}</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
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
                      'flex flex-col items-center justify-center gap-3 rounded-lg p-6 text-lg font-semibold transition-all cursor-pointer',
                      'border-2 border-transparent',
                      'hover:bg-accent hover:text-accent-foreground',
                      'peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-accent-foreground'
                    )}
                  >
                    <SunDim className="h-7 w-7" />
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
                      'flex flex-col items-center justify-center gap-3 rounded-lg p-6 text-lg font-semibold transition-all cursor-pointer',
                      'border-2 border-transparent',
                      'hover:bg-accent hover:text-accent-foreground',
                      'peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-accent-foreground'
                    )}
                  >
                    <MoonStar className="h-7 w-7" />
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
                      'flex flex-col items-center justify-center gap-3 rounded-lg p-6 text-lg font-semibold transition-all cursor-pointer',
                      'border-2 border-transparent',
                      'hover:bg-accent hover:text-accent-foreground',
                      'peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-accent-foreground'
                    )}
                  >
                    <Monitor className="h-7 w-7" />
                    {t('system')}
                  </Label>
                </div>
              </RadioGroup>
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
                <Label htmlFor="server-offline" className="text-lg cursor-pointer">{t('serverOfflineAlerts')}</Label>
                <p className="text-base text-muted-foreground">
                  {t('serverOfflineAlertsDescription')}
                </p>
              </div>
              <Switch id="server-offline" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div className="space-y-1">
                <Label htmlFor="client-expiry" className="text-lg cursor-pointer">{t('clientExpiryWarnings')}</Label>
                <p className="text-base text-muted-foreground">
                  {t('clientExpiryWarningsDescription')}
                </p>
              </div>
              <Switch id="client-expiry" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div className="space-y-1">
                <Label htmlFor="weekly-summary" className="text-lg cursor-pointer">{t('weeklySummary')}</Label>
                <p className="text-base text-muted-foreground">
                  {t('weeklySummaryDescription')}
                </p>
              </div>
              <Switch id="weekly-summary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-8">
            <CardTitle className="text-2xl">{t('language')}</CardTitle>
            <CardDescription className="text-lg">
              {t('languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8 pt-0">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="pt-br"
                checked={language === 'pt-BR'}
                onCheckedChange={() => handleLanguageChange('pt-BR')}
              />
              <Label htmlFor="pt-br" className="text-lg cursor-pointer">
                Português (Brasil)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="en-us"
                checked={language === 'en-US'}
                onCheckedChange={() => handleLanguageChange('en-US')}
              />
              <Label htmlFor="en-us" className="text-lg cursor-pointer">
                English
              </Label>
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
