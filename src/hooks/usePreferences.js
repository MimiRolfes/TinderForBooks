import { useEffect, useState } from "react";
import { STORAGE_KEYS, getPreferences, setPreferences } from "../services/storageService";

// Unified preferences shape:
// { genres: string[], length: string, language: string, author: string, pagesMin: number|null, pagesMax: number|null }

const lengthToPages = (len) => {
  if (len === "<100")   return { pagesMin: null, pagesMax: 99 };
  if (len === "100-300") return { pagesMin: 100,  pagesMax: 300 };
  if (len === "300-500") return { pagesMin: 300,  pagesMax: 500 };
  if (len === ">500")    return { pagesMin: 501,  pagesMax: null };
  return { pagesMin: null, pagesMax: null };
};

// Migriert alte Sessions, die noch kein pagesMin/pagesMax haben
const migratePrefs = (raw) => {
  if (!raw) return null;
  if (raw.pagesMin !== undefined) return raw; // bereits im neuen Format
  const { pagesMin, pagesMax } = lengthToPages(raw.length);
  return { ...raw, pagesMin, pagesMax };
};

export function usePreferences() {
  const [prefs, setPrefsState] = useState(() => migratePrefs(getPreferences()));

  // Hält Preferences aktuell, wenn sie in einem anderen Tab geändert werden
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEYS.PREFS_LEGACY) {
        setPrefsState(migratePrefs(getPreferences()));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Speichert Preferences und aktualisiert den lokalen State
  const savePreferences = ({ genres, length, language, author }) => {
    const { pagesMin, pagesMax } = lengthToPages(length);
    const unified = { genres, length, language, author, pagesMin, pagesMax };
    setPreferences(unified);
    setPrefsState(unified);
  };

  return { prefs, savePreferences };
}
