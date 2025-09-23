'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DashboardPeriod = 'today' | 'this_month' | 'last_30_days' | 'this_year';
export type FinancialPeriodFilter = 'daily' | 'monthly' | 'yearly';
export type FinancialTypeFilter = 'all' | 'income' | 'expense';

interface DashboardSettingsContextType {
  newSubscriptionsPeriod: DashboardPeriod;
  setNewSubscriptionsPeriod: (period: DashboardPeriod) => void;
  expirationWarningDays: number;
  setExpirationWarningDays: (days: number) => void;
  financialPeriodFilter: FinancialPeriodFilter;
  setFinancialPeriodFilter: (period: FinancialPeriodFilter) => void;
  financialTypeFilter: FinancialTypeFilter;
  setFinancialTypeFilter: (type: FinancialTypeFilter) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string; 
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export const DashboardSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newSubscriptionsPeriod, setNewSubscriptionsPeriodState] = useState<DashboardPeriod>('this_month');
  const [expirationWarningDays, setExpirationWarningDaysState] = useState<number>(7);
  const [financialPeriodFilter, setFinancialPeriodFilterState] = useState<FinancialPeriodFilter>('daily');
  const [financialTypeFilter, setFinancialTypeFilterState] = useState<FinancialTypeFilter>('all');


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
    const storedFinancialPeriod = localStorage.getItem('financial_periodFilter') as FinancialPeriodFilter;
    if (storedFinancialPeriod) {
      setFinancialPeriodFilterState(storedFinancialPeriod);
    }
    const storedFinancialType = localStorage.getItem('financial_typeFilter') as FinancialTypeFilter;
    if (storedFinancialType) {
        setFinancialTypeFilterState(storedFinancialType);
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

  const setFinancialPeriodFilter = (period: FinancialPeriodFilter) => {
    localStorage.setItem('financial_periodFilter', period);
    setFinancialPeriodFilterState(period);
  }

  const setFinancialTypeFilter = (type: FinancialTypeFilter) => {
    localStorage.setItem('financial_typeFilter', type);
    setFinancialTypeFilterState(type);
  }

  const t = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <DashboardSettingsContext.Provider value={{ 
        newSubscriptionsPeriod, setNewSubscriptionsPeriod, 
        expirationWarningDays, setExpirationWarningDays,
        financialPeriodFilter, setFinancialPeriodFilter,
        financialTypeFilter, setFinancialTypeFilter,
        t 
    }}>
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