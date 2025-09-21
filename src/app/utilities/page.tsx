'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function UtilitiesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    const savedNotes = localStorage.getItem('utilities_notepad');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleSaveNotes = () => {
    localStorage.setItem('utilities_notepad', notes);
    toast({
      title: t('success'),
      description: t('notesSavedSuccess'),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('utilities')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('utilitiesDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('notepad')}</CardTitle>
          <CardDescription>{t('notepadDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notepadPlaceholder')}
            className="min-h-[300px] text-base"
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveNotes}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveNotes')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
