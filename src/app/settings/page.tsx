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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup defaultValue="system" className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Light
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Dark
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system" className="peer sr-only" />
                  <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary" style={{backgroundColor: "hsl(var(--primary))"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#3b82f6"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#16a34a"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#ea580c"}} />
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{backgroundColor: "#9333ea"}} />
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Server Offline Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive an email when a server goes offline.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Client Expiry Warnings</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified 7 days before a client's subscription expires.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Weekly Summary</Label>
                <p className="text-xs text-muted-foreground">
                  Receive a weekly summary report via email.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="mt-6 flex justify-end">
            <Button>Save Preferences</Button>
        </div>
    </div>
  );
}
