'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DashboardPeriod = 'today' | 'this_month' | 'last_30_days' | 'this_year';

interface DashboardSettingsContextType {
  newSubscriptionsPeriod: DashboardPeriod;
  setNewSubscriptionsPeriod: (period: DashboardPeriod) => void;
  expirationWarningDays: number;
  setExpirationWarningDays: (days: number) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string; 
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export const DashboardSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newSubscriptionsPeriod, setNewSubscriptionsPeriodState] = useState<DashboardPeriod>('this_month');
  const [expirationWarningDays, setExpirationWarningDaysState] = useState<number>(7);

  useEffect(() => {
    const storedPeriod = localStorage.getItem('dashboard_newSubscriptionsPeriod') as DashboardPeriod;
    if (storedPeriod) {
      setNewSubscriptionsPeriodState(storedPeriod);
    }
    const storedWarningDays = localStorage.getItem('dashboard_expirationWarningDays');
    if (storedWarningDays) {
      const days = Number(storedWarningDays);
      setExpirationWarningDaysState(isNaN(days) ? 7 : days);
    }
  }, []);

  const setNewSubscriptionsPeriod = (period: DashboardPeriod) => {
    localStorage.setItem('dashboard_newSubscriptionsPeriod', period);
    setNewSubscriptionsPeriodState(period);
  };
  
  const setExpirationWarningDays = (days: number) => {
    const validDays = Math.max(1, Math.min(30, days));
    localStorage.setItem('dashboard_expirationWarningDays', String(validDays));
    setExpirationWarningDaysState(validDays);
  }

  const t = (key: string) => {
    // This is a placeholder. In a real app, you'd use a full i18n library.
    // For now, we'll just return the key in a more readable format.
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <DashboardSettingsContext.Provider value={{ newSubscriptionsPeriod, setNewSubscriptionsPeriod, expirationWarningDays, setExpirationWarningDays, t }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
};

export const useDashboardSettings = (): DashboardSettingsContextType => {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
};
