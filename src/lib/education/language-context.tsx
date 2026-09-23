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

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = localStorage.getItem("edu-lang") as Locale | null;
    if (stored === "ja" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("edu-lang", l);
    // Keep SSR metadata/layout in sync with the client language toggle
    document.cookie = `edu-locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
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
