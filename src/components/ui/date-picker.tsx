'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CaptionProps } from 'react-day-picker';

import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [month, setMonth] = React.useState<Date>(value || new Date());
  
  const locale = language === 'pt-BR' ? ptBR : enUS;

  React.useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setMonth(value);
    }
  }, [value]);

  const handleOkClick = () => {
    onChange(selectedDate);
  };

  const handleCancelClick = () => {
    // Reset to original value on cancel
    setSelectedDate(value);
    onChange(value); // Close popover by calling onChange with original value
  };
  
  function CustomCaption(props: CaptionProps) {
    const { displayMonth } = props;
    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 100;
    const toYear = currentYear;
    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const handleMonthChange = (month: string) => {
      const newMonth = new Date(displayMonth.getFullYear(), parseInt(month, 10));
      setMonth(newMonth);
    };

    const handleYearChange = (year: string) => {
       const newMonth = new Date(parseInt(year, 10), displayMonth.getMonth());
       setMonth(newMonth);
    };

    return (
       <div className="flex justify-center items-center relative gap-2 mb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
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
              {months.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {format(new Date(displayMonth.getFullYear(), m), 'MMMM', { locale })}
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
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        month={month}
        onMonthChange={setMonth}
        locale={locale}
        captionLayout="dropdown-buttons"
        fromYear={new Date().getFullYear() - 100}
        toYear={new Date().getFullYear()}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4 w-full p-4',
          caption_layout: 'dropdown-buttons flex justify-center items-center gap-2 mb-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'hidden',
          head_row: 'flex mb-2 justify-between',
          head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-base',
          row: 'flex w-full mt-2 justify-between',
          cell: 'h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        }}
        components={{
          Caption: CustomCaption,
        }}
      />
      <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="ghost" onClick={handleCancelClick}>{t('cancel')}</Button>
          <Button onClick={handleOkClick}>OK</Button>
      </div>
    </>
  );
}
