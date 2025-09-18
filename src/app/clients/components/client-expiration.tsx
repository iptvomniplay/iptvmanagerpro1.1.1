'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { parseISO, differenceInSeconds } from 'date-fns';

interface ClientExpirationProps {
  clientId: string;
  registeredDate: string;
  expirationDate: string;
  onExpire: () => void;
}

const formatRemainingTime = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return 'Expirado';

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

  if (years > 0) return `Expira em ${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} mes${months > 1 ? 'es' : ''}` : ''}`;
  if (months > 0) return `Expira em ${months} mes${months > 1 ? 'es' : ''}${days > 0 ? ` e ${days} dia${days > 1 ? 's' : ''}` : ''}`;
  if (days > 0) return `Expira em ${days} dia${days > 1 ? 's' : ''}${hours > 0 ? ` e ${hours} hora${hours > 1 ? 's' : ''}` : ''}`;
  if (hours > 0) return `Expira em ${hours} hora${hours > 1 ? 's' : ''}${minutes > 0 ? ` e ${minutes} min` : ''}`;
  if (minutes > 0) return `Expira em ${minutes} minuto${minutes > 1 ? 's' : ''} e ${seconds} seg`;
  return `Expira em ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
};


export function ClientExpiration({
  clientId,
  registeredDate,
  expirationDate,
  onExpire,
}: ClientExpirationProps) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(1);
  const [hasExpired, setHasExpired] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;

    const registration = parseISO(registeredDate);
    const expiration = parseISO(expirationDate);
    
    setTotalDuration(differenceInSeconds(expiration, registration));

    const intervalId = setInterval(() => {
      const now = new Date();
      const secondsLeft = differenceInSeconds(expiration, now);

      if (secondsLeft <= 0) {
        setRemainingSeconds(0);
        if (!hasExpired) {
          onExpire();
          setHasExpired(true);
        }
        clearInterval(intervalId);
      } else {
        setRemainingSeconds(secondsLeft);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expirationDate, registeredDate, onExpire, hasExpired, isClient]);

  if (!isClient) {
    return null; // Don't render on the server
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
  
  const timeText = formatRemainingTime(remainingSeconds);

  return (
    <div className="space-y-2 w-48">
      <span className="text-sm font-medium">{timeText}</span>
      {timeText !== 'Expirado' && (
        <Progress value={progressPercentage} className="h-2 [&>div]:bg-green-500" indicatorClassName={progressColorClass} />
      )}
    </div>
  );
}
