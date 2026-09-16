"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Locale = "en" | "ja";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("edu-lang") as Locale | null;
    if (stored === "ja" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("edu-lang", l);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  return useContext(LanguageContext);
}
