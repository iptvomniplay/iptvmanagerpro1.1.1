'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type DashboardPeriod = 'today' | 'this_month' | 'last_30_days' | 'this_year';

interface DashboardSettingsContextType {
  newSubscriptionsPeriod: DashboardPeriod;
  setNewSubscriptionsPeriod: (period: DashboardPeriod) => void;
  t: (key: string) => string; 
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export const DashboardSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newSubscriptionsPeriod, setNewSubscriptionsPeriodState] = useState<DashboardPeriod>('this_month');

  useEffect(() => {
    const storedPeriod = localStorage.getItem('dashboard_newSubscriptionsPeriod') as DashboardPeriod;
    if (storedPeriod) {
      setNewSubscriptionsPeriodState(storedPeriod);
    }
  }, []);

  const setNewSubscriptionsPeriod = (period: DashboardPeriod) => {
    localStorage.setItem('dashboard_newSubscriptionsPeriod', period);
    setNewSubscriptionsPeriodState(period);
  };
  
  const t = (key: string) => {
    // This is a placeholder. In a real app, you'd use a full i18n library.
    // For now, we'll just return the key in a more readable format.
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <DashboardSettingsContext.Provider value={{ newSubscriptionsPeriod, setNewSubscriptionsPeriod, t }}>
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
