'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, CaptionProps } from 'react-day-picker';

import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
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
    
    const { displayMonth, onMonthChange, previousMonth, nextMonth } = props;

    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 100;
    const toYear = currentYear;
    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    if (!displayMonth) {
      return null;
    }
    
    const handleMonthChange = (month: string) => {
        const newDate = new Date(displayMonth.getFullYear(), parseInt(month, 10));
        onMonthChange?.(newDate);
    };

    const handleYearChange = (year: string) => {
        const newDate = new Date(parseInt(year, 10), displayMonth.getMonth());
        onMonthChange?.(newDate);
    };

    return (
       <div className="flex justify-center items-center relative gap-2 mb-4">
         <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={!previousMonth}
          onClick={() => previousMonth && onMonthChange?.(previousMonth)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Select
            value={String(displayMonth.getMonth())}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px] text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={String(month)}>
                  {format(new Date(displayMonth.getFullYear(), month), 'MMMM', { locale })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(displayMonth.getFullYear())}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-9 w-[100px] text-base">
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
          className="h-9 w-9"
          disabled={!nextMonth}
          onClick={() => nextMonth && onMonthChange?.(nextMonth)}
        >
          <ChevronRight className="h-5 w-5" />
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
      <PopoverContent className="w-auto p-4 bg-background">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value || new Date(new Date().setFullYear(new Date().getFullYear() - 30))}
          locale={locale}
          captionLayout="dropdown-buttons"
          fromYear={new Date().getFullYear() - 100}
          toYear={new Date().getFullYear()}
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption_layout: 'dropdown-buttons flex justify-center items-center gap-2 mb-4',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'hidden',
            head_row: 'flex mb-2 justify-between',
            head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-base',
            row: 'flex w-full mt-2 justify-between',
            cell: 'h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: cn(
              buttonVariants({ variant: 'ghost' }),
              'h-12 w-12 p-0 font-normal aria-selected:opacity-100'
            ),
          }}
          components={{
            Caption: CustomCaption,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}