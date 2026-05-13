import { createContext, useContext, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("t4b_lang") || "en";
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === "en" ? "de" : "en";
      localStorage.setItem("t4b_lang", next);
      return next;
    });
  };

  // t("wishlist.title") → looks up translations[lang].wishlist.title
  const t = (key) => {
    const parts = key.split(".");
    let value = translations[lang];
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    // Fallback: try English, then return the key itself
    if (value === undefined) {
      let fallback = translations["en"];
      for (const part of parts) {
        fallback = fallback?.[part];
        if (fallback === undefined) break;
      }
      return fallback ?? key;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
