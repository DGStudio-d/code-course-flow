
import React, { createContext, useContext, useState } from "react";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  translations: Record<string, string>;
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
  const [currentLanguage, setCurrentLanguage] = useState("ar");
  
  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem("language", language);
  };

  // Mock translations
  const translations: Record<string, string> = {
    "home": currentLanguage === "ar" ? "الرئيسية" : "Home",
    "courses": currentLanguage === "ar" ? "الدورات" : "Courses",
    "teachers": currentLanguage === "ar" ? "المعلمون" : "Teachers",
    "contact": currentLanguage === "ar" ? "اتصل بنا" : "Contact"
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
