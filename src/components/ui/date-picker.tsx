'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

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
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { t, language } = useLanguage();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    // Não fecha o popover aqui para permitir a seleção de ano/mês
  };

  const handleConfirm = () => {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'PPP', { locale: language === 'pt-BR' ? ptBR : undefined })
          ) : (
            <span>{t('pickADate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown-nav"
          fromYear={1960}
          toYear={new Date().getFullYear() + 10}
          components={{
            Caption: ({...props}) => {
                const { fromDate, toDate, fromMonth, toMonth, fromYear, toYear } = (props.displayMonths[0] as any).props;
                const { goToMonth, displayMonth } = props;

                const handleYearChange = (value: string) => {
                    const newDate = new Date(displayMonth);
                    newDate.setFullYear(parseInt(value));
                    goToMonth(newDate);
                };

                const handleMonthChange = (value: string) => {
                    const newDate = new Date(displayMonth);
                    newDate.setMonth(parseInt(value));
                    goToMonth(newDate);
                };

                const years = Array.from({ length: (toYear || 0) - (fromYear || 0) + 1 }, (_, i) => (fromYear || 0) + i);
                
                const months = Array.from({length: 12}, (_, i) => ({
                    label: format(new Date(2000, i, 1), 'MMMM', { locale: language === 'pt-BR' ? ptBR : undefined }),
                    value: i
                }));

                return (
                    <div className="flex justify-center items-center gap-2 p-2">
                         <Select onValueChange={handleMonthChange} value={String(displayMonth.getMonth())}>
                            <SelectTrigger className="w-auto focus:ring-0">
                               <SelectValue placeholder={t('selectMonth')} />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={handleYearChange} value={String(displayMonth.getFullYear())}>
                            <SelectTrigger className="w-auto focus:ring-0">
                               <SelectValue placeholder={t('selectYear')} />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )
            },
          }}
        />
        <div className="p-2 border-t flex justify-end">
            <Button onClick={handleConfirm} size="sm">{t('confirm')}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
