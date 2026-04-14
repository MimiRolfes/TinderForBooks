// ─── Storage Keys ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  SWIPED_IDS:   "tinderForBooks_swipedIds",
  LIKED_BOOKS:  "tinderForBooks_likedBooks",
  READ_BOOKS:   "tinderForBooks_readBooks",
  PREFS_LEGACY: "tinderForBooks_preferences", // { genres, length, language, author }
  PREFS_SWIPE:  "t4b_prefs",                  // { genre, author, language, pagesMin, pagesMax }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseJSON = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// ─── Swiped IDs ──────────────────────────────────────────────────────────────
export const getSwipedIds = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.SWIPED_IDS);
  return new Set(parseJSON(raw, []));
};

export const setSwipedIds = (idSet) => {
  localStorage.setItem(STORAGE_KEYS.SWIPED_IDS, JSON.stringify([...idSet]));
};

// ─── Liked Books (Wishlist) ───────────────────────────────────────────────────
export const getLikedBooks = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.LIKED_BOOKS);
  const parsed = parseJSON(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const addLikedBook = (book) => {
  const books = getLikedBooks();
  if (books.some((b) => b.id === book.id)) return;
  localStorage.setItem(STORAGE_KEYS.LIKED_BOOKS, JSON.stringify([...books, book]));
};

export const setLikedBooks = (books) => {
  localStorage.setItem(STORAGE_KEYS.LIKED_BOOKS, JSON.stringify(books));
};

export const clearLikedBooks = () => {
  localStorage.removeItem(STORAGE_KEYS.LIKED_BOOKS);
};

// ─── Read Books ───────────────────────────────────────────────────────────────
export const getReadBooks = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.READ_BOOKS);
  const parsed = parseJSON(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const addReadBook = (book) => {
  const books = getReadBooks();
  if (books.some((b) => b.id === book.id)) return;
  localStorage.setItem(STORAGE_KEYS.READ_BOOKS, JSON.stringify([...books, book]));
};

export const setReadBooks = (books) => {
  localStorage.setItem(STORAGE_KEYS.READ_BOOKS, JSON.stringify(books));
};

export const clearReadBooks = () => {
  localStorage.removeItem(STORAGE_KEYS.READ_BOOKS);
};

// ─── Preferences ─────────────────────────────────────────────────────────────
// Liest das Legacy-Format, das Swipe.jsx aktuell erwartet: { genres, length, language, author }
export const getPreferences = () => {
  const raw = sessionStorage.getItem(STORAGE_KEYS.PREFS_LEGACY);
  return parseJSON(raw, null);
};

// Schreibt beide Formate rückwärtskompatibel
export const setPreferences = ({ genres, length, language, author, pagesMin, pagesMax }) => {
  const legacy = { genres, length, language, author };
  sessionStorage.setItem(STORAGE_KEYS.PREFS_LEGACY, JSON.stringify(legacy));

  const forSwipe = { genre: genres?.[0] ?? "", author, language, pagesMin, pagesMax };
  sessionStorage.setItem(STORAGE_KEYS.PREFS_SWIPE, JSON.stringify(forSwipe));
};
