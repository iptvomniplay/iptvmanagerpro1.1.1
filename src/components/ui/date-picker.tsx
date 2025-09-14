'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker, CaptionProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { useLanguage } from '@/hooks/use-language';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const { language } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (date: Date) => {
    onChange(date);
  };
  
  const handleYearChange = (year: string) => {
    const newDate = set(value || new Date(), { year: parseInt(year) });
    onChange(newDate);
    setOpen(false); // Fecha o popover ao selecionar o ano
  };

  const handleMonthChange = (month: string) => {
    const newDate = set(value || new Date(), { month: parseInt(month) });
    onChange(newDate);
  };
  
  function CustomCaption(props: CaptionProps) {
     if (!props.displayMonths || props.displayMonths.length === 0) {
      return null;
    }
    const { fromYear, fromMonth, fromDate, toYear, toMonth, toDate } = { fromYear: 1900, toYear: new Date().getFullYear(), fromMonth: undefined, fromDate: undefined, toMonth: undefined, toDate: undefined };
    const currentMonth = props.displayMonths[0].date;

    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="flex justify-center gap-2 mb-4">
        <Select
          value={currentMonth.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {format(new Date(0, month), 'MMMM', { locale: language === 'pt-BR' ? ptBR : undefined })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentMonth.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {value ? (
            format(value, 'PPP', {
              locale: language === 'pt-BR' ? ptBR : undefined,
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={(date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
          components={{
            Caption: CustomCaption,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
