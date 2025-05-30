
import React, { createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

export type SupportedLanguage = 'ar' | 'en' | 'es';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n, t } = useTranslation();
  
  const setLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as SupportedLanguage;
    if (savedLanguage && ['ar', 'en', 'es'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n]);

  const value: LanguageContextType = {
    language: i18n.language as SupportedLanguage,
    setLanguage,
    t,
    dir: i18n.language === 'ar' ? 'rtl' : 'ltr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
