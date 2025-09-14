'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

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
    setOpen(false);
  };

  function CustomCaption({
    displayMonth,
    onMonthChange,
  }: {
    displayMonth: Date;
    onMonthChange: (month: Date) => void;
  }) {
    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 100;
    const toYear = currentYear;
    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="flex justify-between items-center px-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
           <Select
            value={String(displayMonth.getMonth())}
            onValueChange={(value) => {
              onMonthChange(new Date(displayMonth.getFullYear(), Number(value)));
            }}
          >
            <SelectTrigger className="h-8 w-[120px]">
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
            onValueChange={(value) => {
               const newDate = new Date(Number(value), displayMonth.getMonth());
               onMonthChange(newDate);
            }}
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
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
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
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value || new Date()}
          locale={locale}
          components={{
            Caption: (props) => <CustomCaption displayMonth={props.displayMonth} onMonthChange={(month) => {
              const newDate = new Date(month);
              if (value) {
                newDate.setDate(value.getDate());
              }
              onChange(newDate);
            }} />,
          }}
          fromYear={new Date().getFullYear() - 100}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
