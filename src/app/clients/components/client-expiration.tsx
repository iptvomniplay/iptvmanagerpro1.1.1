'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { parseISO, differenceInSeconds, add, endOfDay } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import type { PlanPeriod } from '@/lib/types';

interface ClientExpirationProps {
  clientId: string;
  registeredDate: string;
  planPeriod: PlanPeriod;
  onExpire: () => void;
}

export function ClientExpiration({
  clientId,
  registeredDate,
  planPeriod,
  onExpire,
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
    const seconds = totalSeconds % 60;

    if (years > 0) return `${t('expiresIn')} ${years} ${t(years > 1 ? 'years' : 'year')}${months > 0 ? ` ${t('and')} ${months} ${t(months > 1 ? 'months' : 'month')}` : ''}`;
    if (months > 0) return `${t('expiresIn')} ${months} ${t(months > 1 ? 'months' : 'month')}${days > 0 ? ` ${t('and')} ${days} ${t(days > 1 ? 'days' : 'day')}` : ''}`;
    if (days > 0) return `${t('expiresIn')} ${days} ${t(days > 1 ? 'days' : 'day')}${hours > 0 ? ` ${t('and')} ${hours} ${t(hours > 1 ? 'hours' : 'hour')}` : ''}`;
    if (hours > 0) return `${t('expiresIn')} ${hours} ${t(hours > 1 ? 'hours' : 'hour')}${minutes > 0 ? ` ${t('and')} ${minutes} min` : ''}`;
    if (minutes > 0) return `${t('expiresIn')} ${minutes} ${t(minutes > 1 ? 'minutes' : 'minute')} ${t('and')} ${seconds} ${t('seconds')}`;
    return `${t('expiresIn')} ${seconds} ${t(seconds !== 1 ? 'seconds' : 'second')}`;
  }, [t]);


  React.useEffect(() => {
    if (!isClient || !planPeriod) return;

    const registrationDate = parseISO(registeredDate);

    const getDuration = (period: PlanPeriod) => {
        switch (period) {
            case '30d': return { days: 30 };
            case '3m': return { months: 3 };
            case '6m': return { months: 6 };
            case '1y': return { years: 1 };
            default: return {};
        }
    }
    
    const expiration = endOfDay(add(registrationDate, getDuration(planPeriod)));
    const now = new Date();
    
    setTotalDuration(differenceInSeconds(expiration, registrationDate));

    const intervalId = setInterval(() => {
      const now = new Date();
      const secondsLeft = differenceInSeconds(expiration, now);

      if (secondsLeft <= 0) {
        setRemainingSeconds(0);
        setRemainingTimeText(formatRemainingTime(0));
        if (!hasExpired) {
          onExpire();
          setHasExpired(true);
        }
        clearInterval(intervalId);
      } else {
        setRemainingSeconds(secondsLeft);
        setRemainingTimeText(formatRemainingTime(secondsLeft));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [planPeriod, registeredDate, onExpire, hasExpired, isClient, formatRemainingTime]);

  if (!isClient || !planPeriod) {
    return null; // Don't render on the server or if no due date
  }

  const progressPercentage = (remainingSeconds / totalDuration) * 100;
  
  let progressColorClass;
  if (progressPercentage < 15) {
    progressColorClass = 'bg-destructive'; // red
  } else if (progressPercentage < 50) {
    progressColorClass = 'bg-yellow-500'; // yellow/orange
  } else {
    progressColorClass = 'bg-green-500'; // green
  }
  
  return (
    <div className="space-y-2 w-48">
      <span className="text-sm font-medium">{remainingTimeText}</span>
      {remainingTimeText !== t('expired') && (
        <Progress value={progressPercentage} className="h-2 [&>div]:bg-green-500" indicatorClassName={progressColorClass} />
      )}
    </div>
  );
}
