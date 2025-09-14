'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, CaptionProps } from 'react-day-picker';

import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';


interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const locale = language === 'pt-BR' ? ptBR : enUS;

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      setOpen(false);
    }
  };
  
  function CustomCaption(props: CaptionProps) {
    const { t, language } = useLanguage();
    const locale = language === 'pt-BR' ? ptBR : enUS;
    
    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 100;
    const toYear = currentYear;
    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const handleMonthChange = (month: number) => {
      const newDate = new Date(props.displayMonth.getFullYear(), month);
      if (props.onMonthChange) {
        props.onMonthChange(newDate);
      }
    };

    const handleYearChange = (year: number) => {
      const newDate = new Date(year, props.displayMonth.getMonth());
       if (props.onMonthChange) {
        props.onMonthChange(newDate);
      }
    };

    return (
       <div className="flex justify-center items-center relative gap-2 mb-4">
         <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!props.previousMonth}
          onClick={() => props.onMonthChange && props.previousMonth && props.onMonthChange(props.previousMonth)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Select
            value={String(props.displayMonth.getMonth())}
            onValueChange={(value) => handleMonthChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={String(month)}>
                  {format(new Date(props.displayMonth.getFullYear(), month), 'MMMM', { locale })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(props.displayMonth.getFullYear())}
            onValueChange={(value) => handleYearChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!props.nextMonth}
          onClick={() => props.onMonthChange && props.nextMonth && props.onMonthChange(props.nextMonth)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
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
          {value ? format(value, 'PPP', { locale }) : <span>{t('pickADate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value || new Date(new Date().setFullYear(new Date().getFullYear() - 30))}
          locale={locale}
          components={{
            Caption: CustomCaption,
          }}
          fromYear={new Date().getFullYear() - 100}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
