'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { validateConfiguration } from '@/app/servers/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';

const initialState = {
  report: undefined,
  error: undefined,
};

const defaultJson = JSON.stringify(
  {
    "bitrate": "5000kbps",
    "resolution": "1920x1080",
    "codec": "h264",
    "gop_size": 250,
    "buffer_size": "10000k"
  },
  null,
  2
);


function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('validating')}...
        </>
      ) : (
        t('validateConfiguration')
      )}
    </Button>
  );
}

export function ConfigurationForm() {
  const { t } = useLanguage();
  const [state, formAction] = useFormState(validateConfiguration, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
      if (!state.error && state.report) {
          formRef.current?.reset();
      }
  }, [state])

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="parameters" className="text-base">{t('serverParameters')}</Label>
          <Textarea
            id="parameters"
            name="parameters"
            placeholder='{ "bitrate": "5000kbps" }'
            rows={12}
            required
            defaultValue={defaultJson}
            className="text-base"
            autoComplete="off"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="contentType" className="text-base">{t('contentType')}</Label>
          <Select name="contentType" defaultValue="Live TV">
            <SelectTrigger id="contentType" className="text-base">
              <SelectValue placeholder={t('selectContentType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Live TV">{t('liveTV')}</SelectItem>
              <SelectItem value="VOD">{t('vod')}</SelectItem>
              <SelectItem value="4K Streaming">{t('fourKStreaming')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SubmitButton />
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t('validationResult')}</h3>
        <Card className="min-h-[240px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                    {state.error && <><AlertCircle className="text-destructive h-6 w-6"/> <span>{t('validationFailed')}</span></>}
                    {state.report && <><CheckCircle className="text-green-500 h-6 w-6"/> <span>{t('validationReport')}</span></>}
                    {!state.error && !state.report && <span className="text-muted-foreground">{t('awaitingInput')}</span>}
                </CardTitle>
            </CardHeader>
          <CardContent>
            {state.error && (
              <p className="text-base text-destructive">{state.error}</p>
            )}
            {state.report && (
              <p className="whitespace-pre-wrap text-base text-muted-foreground">{state.report}</p>
            )}
            {!state.error && !state.report && (
                <p className="text-base text-muted-foreground">{t('validationReportMessage')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
