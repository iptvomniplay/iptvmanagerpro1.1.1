'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Checkbox } from '@/components/ui/checkbox';

export default function SettingsPage() {

  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: 'pt-BR' | 'en-US') => {
    setLanguage(lang);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
            <CardDescription>
              {t('appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('theme')}</Label>
              <RadioGroup defaultValue="dark" className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    {t('light')}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    {t('dark')}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system" className="peer sr-only" />
                  <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    {t('system')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label>{t('primaryColor')}</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary" style={{backgroundColor: "hsl(var(--primary))"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#2196F3"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#4CAF50"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#FFC107"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#9C27B0"}} />
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
            <CardDescription>
              {t('notificationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('serverOfflineAlerts')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('serverOfflineAlertsDescription')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('clientExpiryWarnings')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('clientExpiryWarningsDescription')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('weeklySummary')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('weeklySummaryDescription')}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('language')}</CardTitle>
                <CardDescription>
                    {t('languageDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="pt-br"
                        checked={language === 'pt-BR'}
                        onCheckedChange={() => handleLanguageChange('pt-BR')}
                    />
                    <Label htmlFor="pt-br">Português (Brasil)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="en-us"
                        checked={language === 'en-US'}
                        onCheckedChange={() => handleLanguageChange('en-US')}
                    />
                    <Label htmlFor="en-us">English</Label>
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="mt-6 flex justify-end">
            <Button>{t('savePreferences')}</Button>
        </div>
    </div>
  );
}
