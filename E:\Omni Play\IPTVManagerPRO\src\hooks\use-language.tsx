'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ptTranslations from '@/locales/pt.json';
import enTranslations from '@/locales/en.json';

type Language = 'pt-BR' | 'en-US';
type Translations = typeof ptTranslations;

const translations: Record<Language, Translations> = {
  'pt-BR': ptTranslations,
  'en-US': enTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations | string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && (storedLanguage === 'pt-BR' || storedLanguage === 'en-US')) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: keyof Translations | string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof Translations] || (key as string);
    
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            const value = replacements[placeholder];
            translation = translation.replace(`{${placeholder}}`, String(value));
        });
    }

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};