
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type LanguageType = "en" | "bn";

interface LanguageContextType {
  language: LanguageType;
  toggleLanguage: () => void;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>(() => {
    // Initialize with saved preference from localStorage if available
    const savedLanguage = localStorage.getItem("preferredLanguage");
    return (savedLanguage === "en" || savedLanguage === "bn") ? savedLanguage : "en";
  });

  useEffect(() => {
    // Save language preference to localStorage whenever it changes
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"));
  };

  const isEnglish = language === "en";

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isEnglish }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
