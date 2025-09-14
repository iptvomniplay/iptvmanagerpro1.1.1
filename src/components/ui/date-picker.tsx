'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{t('pickADate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1900}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
