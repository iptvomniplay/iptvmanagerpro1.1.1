import { ConfigurationForm } from './components/configuration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function ConfigureServerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Server Parameter Validator
        </h1>
        <p className="text-muted-foreground">
          Use our AI tool to validate your server parameters for optimal
          performance.
        </p>
      </div>

       <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            Paste your server configuration as a JSON object, select the content
            type, and our AI will provide a validation report with
            recommendations.
          </AlertDescription>
        </Alert>

      <Card>
        <CardHeader>
            <CardTitle>Configuration Validator</CardTitle>
            <CardDescription>Enter your parameters below to get a validation report.</CardDescription>
        </CardHeader>
        <CardContent>
            <ConfigurationForm />
        </CardContent>
      </Card>
    </div>
  );
}
