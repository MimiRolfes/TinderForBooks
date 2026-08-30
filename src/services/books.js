// ─── Book source for the guest swipe deck ────────────────────────────────────
// Guest mode has no backend. The deck is filled from the Open Library API
// (free, no key, CORS-enabled) based on the genre deck the guest tapped or the
// preferences they set.
//
// Data contract (what the UI consumes — also the spec for the Flutter port):
//   {
//     id:         string,        // Open Library work key, e.g. "/works/OL123W"
//     title:      string,
//     author:     string,        // first author, "" if unknown
//     cover:      string,        // https cover URL, "" if none
//     claptext:   string,        // plain-text blurb, "" if none
//     genre:      string,        // the subject that produced this book
//     pageCount:  number | null,
//     isbn:       string | null,
//     amazonLink: string,        // Amazon.de search for title + author
//   }
//
// Preferences → query mapping:
//   genres[]  → one `subject:"…"` search per genre (max 3), results interleaved
//   pages     → "<100"/"<350"/"<500" → max pages ; ">500" → min pages
//   language  → "Deutsch"|"English" → language=ger|eng
//   author    → `author:"…"`

const SEARCH_URL = "https://openlibrary.org/search.json";
const workUrl = (key) => `https://openlibrary.org${key}.json`;
const coverUrl = (id, size = "M") => `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;

const PAGE_RANGES = {
  "<100": { max: 100 },
  "<350": { max: 350 },
  "<500": { max: 500 },
  ">500": { min: 500 },
};
const LANG_CODES = { Deutsch: "ger", English: "eng" };

const clean = (s = "") =>
  String(s)
    .replace(/\r?\n+/g, " ")
    .replace(/\s*\(\[[^\]]*\]\([^)]*\)\)/g, "") // markdown source links Open Library appends
    .replace(/-{3,}.*$/s, "")
    .replace(/\s+/g, " ")
    .trim();

async function searchSubject({ subject, author, language, signal }) {
  const url = new URL(SEARCH_URL);
  const q = [];
  if (subject) q.push(`subject:"${subject}"`);
  if (author) q.push(`author:"${author}"`);
  url.searchParams.set("q", q.join(" ") || "book");
  url.searchParams.set("limit", "26");
  url.searchParams.set(
    "fields",
    "key,title,author_name,cover_i,number_of_pages_median,isbn,ratings_average",
  );
  if (language && LANG_CODES[language]) url.searchParams.set("language", LANG_CODES[language]);

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OpenLibrary ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.docs) ? data.docs : [];
}

async function workDescription(key, signal) {
  try {
    const res = await fetch(workUrl(key), { signal });
    if (!res.ok) return "";
    const data = await res.json();
    const raw = typeof data.description === "string" ? data.description : data.description?.value;
    return clean(raw || "");
  } catch {
    return "";
  }
}

function toUiBook(doc, description, genre) {
  const author = doc.author_name?.[0] || "";
  return {
    id: doc.key,
    title: doc.title || "Untitled",
    author,
    cover: doc.cover_i ? coverUrl(doc.cover_i) : "",
    claptext: description,
    genre,
    pageCount:
      typeof doc.number_of_pages_median === "number" ? doc.number_of_pages_median : null,
    isbn: doc.isbn?.[0] || null,
    amazonLink: `https://www.amazon.de/s?k=${encodeURIComponent(`${doc.title || ""} ${author}`.trim())}`,
  };
}

async function subjectStubs({ subject, author, pages, language, signal }) {
  const range = PAGE_RANGES[pages] || {};
  return (await searchSubject({ subject, author, language, signal }))
    .filter((d) => d.cover_i) // needs a cover to be swipe-worthy
    .filter((d) => {
      const p = d.number_of_pages_median;
      if (p == null) return true;
      if (range.min != null && p < range.min) return false;
      if (range.max != null && p > range.max) return false;
      return true;
    })
    .slice(0, 12)
    .map((d) => toUiBook(d, "", subject || ""));
}

// Fast first paint: search only, blurbs are filled in later by hydrateBlurbs().
export async function fetchGuestDeck({ genre, prefs, signal } = {}) {
  const subjects = genre
    ? [genre]
    : prefs?.genres?.length
      ? prefs.genres
      : ["Romance"];

  // Open Library subject searches return many languages; default to English
  // (these genres are English-dominant) unless the guest chose otherwise.
  const language = prefs?.language || "English";

  const lists = await Promise.all(
    subjects.slice(0, 3).map((subject) =>
      subjectStubs({
        subject,
        author: prefs?.author,
        pages: prefs?.pages,
        language,
        signal,
      }).catch(() => []),
    ),
  );

  // interleave the per-subject lists, dedupe by id
  const seen = new Set();
  const deck = [];
  const maxLen = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      const b = list[i];
      if (!b || seen.has(b.id)) continue;
      seen.add(b.id);
      deck.push(b);
    }
  }
  return deck;
}

// Second pass: fetch blurbs for the given books (one work request each).
export async function hydrateBlurbs(books, signal) {
  const texts = await Promise.all(books.map((b) => workDescription(b.id, signal)));
  return books.map((b, i) => (texts[i] ? { ...b, claptext: texts[i] } : b));
}
