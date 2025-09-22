'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { parseISO, differenceInSeconds, add, endOfDay } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import type { PlanPeriod, Test } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ClientExpirationProps {
  clientId: string;
  onExpire: () => void;
  // Plan props
  planStartDate?: string;
  planPeriod?: PlanPeriod;
  // Test props
  testCreationDate?: string;
  testDurationValue?: number;
  testDurationUnit?: Test['durationUnit'];
}

export function ClientExpiration({
  clientId,
  onExpire,
  planStartDate,
  planPeriod,
  testCreationDate,
  testDurationValue,
  testDurationUnit,
}: ClientExpirationProps) {
  const { t } = useLanguage();
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(1);
  const [hasExpired, setHasExpired] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [remainingTimeText, setRemainingTimeText] = React.useState('');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const formatRemainingTime = React.useCallback((totalSeconds: number): string => {
    if (totalSeconds <= 0) return t('expired');

    const years = Math.floor(totalSeconds / (365 * 24 * 3600));
    totalSeconds %= 365 * 24 * 3600;
    const months = Math.floor(totalSeconds / (30 * 24 * 3600));
    totalSeconds %= 30 * 24 * 3600;
    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds %= 24 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    
    const parts = [];
    if (years > 0) parts.push(`${years} ${t(years > 1 ? 'years' : 'year')}`);
    if (months > 0) parts.push(`${months} ${t(months > 1 ? 'months' : 'month')}`);
    if (days > 0) parts.push(`${days} ${t(days > 1 ? 'days' : 'day')}`);
    if (hours > 0) parts.push(`${hours} ${t(hours > 1 ? 'hours' : 'hour')}`);
    if (minutes > 0) parts.push(`${minutes}min`);

    if (parts.length === 0) {
      const seconds = totalSeconds % 60;
      if (seconds > 0) return `${seconds} ${t(seconds !== 1 ? 'seconds' : 'second')}`;
      return t('expired');
    }
    if (parts.length === 1) return parts[0];
    
    const firstPart = parts.slice(0, parts.length -1).join(', ');
    const lastPart = parts[parts.length -1];
    return `${firstPart} ${t('and')} ${lastPart}`;
  }, [t]);


  React.useEffect(() => {
    if (!isClient) return;

    let startDate: Date;
    let expiration: Date;
    let isTest = false;

    if (planPeriod && planStartDate) {
      startDate = parseISO(planStartDate);
      const getDuration = (period: PlanPeriod) => {
          switch (period) {
              case '30d': return { days: 30 };
              case '3m': return { months: 3 };
              case '6m': return { months: 6 };
              case '1y': return { years: 1 };
              default: return {};
          }
      }
      expiration = endOfDay(add(startDate, getDuration(planPeriod)));
    } else if (testCreationDate && testDurationValue && testDurationUnit) {
      startDate = parseISO(testCreationDate);
      const duration = { [testDurationUnit]: testDurationValue };
      expiration = add(startDate, duration);
      isTest = true;
    } else {
      return; // Not enough data to calculate
    }
    
    setTotalDuration(differenceInSeconds(expiration, startDate));

    const intervalId = setInterval(() => {
      const now = new Date();
      const secondsLeft = differenceInSeconds(expiration, now);

      if (secondsLeft <= 0) {
        setRemainingSeconds(0);
        setRemainingTimeText(formatRemainingTime(0));
        if (!hasExpired) {
          if (isTest) {
            // Only trigger expire if it's a test, plan expiration is handled differently or manually
            onExpire();
          }
          setHasExpired(true);
        }
        clearInterval(intervalId);
      } else {
        setRemainingSeconds(secondsLeft);
        setRemainingTimeText(formatRemainingTime(secondsLeft));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [planPeriod, planStartDate, testCreationDate, testDurationValue, testDurationUnit, onExpire, hasExpired, isClient, formatRemainingTime]);

  if (!isClient || (!planPeriod && !testDurationUnit)) {
    return null; // Don't render on the server or if no due date info
  }

  const progressPercentage = (remainingSeconds / totalDuration) * 100;
  
  let badgeVariant: 'success' | 'warning' | 'destructive' = 'success';
  if (hasExpired) {
    badgeVariant = 'destructive';
  } else if (progressPercentage < 15) {
    badgeVariant = 'destructive';
  } else if (progressPercentage < 50) {
    badgeVariant = 'warning';
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "border-2 border-background/50 shadow-sm",
          badgeVariant === 'success' && 'bg-green-500',
          badgeVariant === 'warning' && 'bg-yellow-500',
          badgeVariant === 'destructive' && 'bg-destructive'
        )}>
          <span className="sr-only">{t('expiresIn')}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        {hasExpired ? (
          <p className="text-center font-semibold">{t('expired')}</p>
        ) : (
          <div className="space-y-2">
            <span className="text-sm font-medium">{remainingTimeText}</span>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
