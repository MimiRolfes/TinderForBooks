import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";

const DEBUG_GB = false;

const BOOKS = [
  { id: 1, title: "Book One", claptext: "This is a short claptext about the book.", cover: "/assets/Book.png" },
  { id: 2, title: "Book Two", claptext: "Another claptext describing the story.", cover: "/assets/Book.png" },
  { id: 3, title: "Book Three", claptext: "More text…", cover: "/assets/Book.png" },
  { id: 4, title: "Book Four", claptext: "More text…", cover: "/assets/Book.png" },
];

const FALLBACK_COVER = "/assets/Book.png";
const SWIPED_STORAGE_KEY = "tinderForBooks_swipedIds";
const PREFS_STORAGE_KEY = "tinderForBooks_preferences";

const KEYWORD_GENRE_MAP = {
  BookTok: "booktok",
  "Dark Romance": "\"dark romance\"",
  "New Adult": "\"new adult\"",
};

const debugLog = (...args) => {
  if (DEBUG_GB) {
    console.log(...args);
  }
};

const redactKey = (urlString) => {
  try {
    const url = new URL(urlString);
    if (url.searchParams.has("key")) {
      url.searchParams.set("key", "REDACTED");
    }
    return url.toString();
  } catch {
    return urlString;
  }
};

const buildQueryFromPrefs = (prefs) => {
  const parts = [];

  if (prefs?.genres?.length) {
    const subjectQuery = prefs.genres
      .map((genre) => {
        const keyword = KEYWORD_GENRE_MAP[genre];
        if (keyword) {
          return `(subject:"${genre}" OR ${keyword})`;
        }
        return `subject:"${genre}"`;
      })
      .join(" OR ");
    parts.push(`(${subjectQuery})`);
  }

  if (prefs?.author) {
    parts.push(`inauthor:"${prefs.author}"`);
  }

  return parts.length ? parts.join(" ") : "fiction";
};

const buildFallbackQuery = (prefs) => {
  const parts = ["(fiction OR novel OR romance OR fantasy OR horror)"];
  if (prefs?.author) {
    parts.push(`inauthor:"${prefs.author}"`);
  }
  return parts.join(" ");
};

const matchesLength = (pageCount, length) => {
  if (!pageCount || !length) return true;
  if (length === "<100") return pageCount < 100;
  if (length === "100-300") return pageCount >= 100 && pageCount <= 300;
  if (length === "300-500") return pageCount >= 300 && pageCount <= 500;
  if (length === ">500") return pageCount > 500;
  return true;
};

const normalizeVolume = (volume, index) => {
  const info = volume.volumeInfo || {};
  const thumbnail = info.imageLinks?.thumbnail;
  const safeCover = thumbnail ? thumbnail.replace(/^http:/, "https:") : FALLBACK_COVER;
  return {
    id: volume.id || `book-${index}`,
    title: info.title || "Untitled",
    claptext: info.description || info.subtitle || "No description available.",
    cover: safeCover,
    pageCount: info.pageCount || null,
  };
};

const createPrefsSnapshot = () => {
  const prefsRaw = sessionStorage.getItem(PREFS_STORAGE_KEY);
  if (!prefsRaw) return null;
  try {
    return JSON.parse(prefsRaw);
  } catch {
    return null;
  }
};

const dedupeById = (items) => {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (!item?.id) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
};

function Card({ book, variant, animClass, onDecide, interactive }) {
  return (
    <div className={`deck-card ${variant} ${animClass || ""}`} style={{ pointerEvents: interactive ? "auto" : "none" }}>
      <div className="card-inner">
        <div className="cover">
          <img src={book.cover} alt={book.title} />
        </div>

        <div className="claptext">
          <h2>{book.title}</h2>
          <p>{book.claptext}</p>
        </div>

        <div className="actions">
          <button className="btn like" onClick={() => onDecide("like")} aria-label="Like">
            ❤
          </button>
          <button className="btn read" onClick={() => onDecide("read")} aria-label="Already read">
            ✔
          </button>
          <button className="btn dislike" onClick={() => onDecide("dislike")} aria-label="Dislike">
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Swipe() {
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [books, setBooks] = useState(BOOKS);
  const [filterSwiped, setFilterSwiped] = useState(false);
  const [swipedIds, setSwipedIds] = useState(() => {
    const raw = localStorage.getItem(SWIPED_STORAGE_KEY);
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  const [prefs, setPrefs] = useState(() => createPrefsSnapshot());

  const [outgoing, setOutgoing] = useState(null);

  const cleanupTimerRef = useRef(null);
  const totalItemsRef = useRef(0);
  const nextStartIndexRef = useRef(0);
  const inFlightRef = useRef(false);
  const activeQueryRef = useRef("");

  const fetchVolumes = async (query, startIndex) => {
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "40");
    url.searchParams.set("orderBy", "relevance");
    url.searchParams.set("startIndex", String(startIndex));
    if (apiKey) url.searchParams.set("key", apiKey);

    debugLog("[GB] request", redactKey(url.toString()));
    const response = await fetch(url.toString());
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    debugLog("[GB] response", {
      status: response.status,
      totalItems: data.totalItems,
      items: items.length,
    });
    return {
      items,
      totalItems: typeof data.totalItems === "number" ? data.totalItems : 0,
    };
  };

  const fetchBatches = async (query, batchCount, startIndex) => {
    const requests = Array.from({ length: batchCount }, (_, i) => fetchVolumes(query, startIndex + i * 40));
    const results = await Promise.all(requests);
    const items = results.flatMap((result) => result.items);
    const totalItems = results.reduce((max, result) => Math.max(max, result.totalItems), 0);
    return { items, totalItems };
  };

  const prepareBooks = (items, lengthPref, swipedSet) => {
    const normalized = items.map(normalizeVolume);
    const missingPageCount = normalized.filter((book) => !book.pageCount).length;
    const lengthFiltered = normalized.filter((book) => matchesLength(book.pageCount, lengthPref));
    const basePool = lengthFiltered.length ? lengthFiltered : normalized;
    const swipedFiltered = basePool.filter((book) => !swipedSet.has(book.id));
    debugLog("[GB] counts", {
      normalized: normalized.length,
      lengthFiltered: lengthFiltered.length,
      swipedFiltered: swipedFiltered.length,
      missingPageCount,
      swipedIds: swipedSet.size,
    });
    return {
      normalized,
      swipedFiltered,
    };
  };

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === PREFS_STORAGE_KEY) {
        setPrefs(createPrefsSnapshot());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (DEBUG_GB) {
      window.__t4bClearSwipes = () => {
        localStorage.removeItem(SWIPED_STORAGE_KEY);
        console.log("[GB] cleared swiped ids");
      };
      return () => {
        delete window.__t4bClearSwipes;
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInitialPool = async () => {
      inFlightRef.current = true;
      totalItemsRef.current = 0;
      nextStartIndexRef.current = 0;

      const initialQuery = buildQueryFromPrefs(prefs);
      activeQueryRef.current = initialQuery;
      debugLog("[GB] query", initialQuery);

      const initialBatchCount = 5;
      const { items, totalItems } = await fetchBatches(initialQuery, initialBatchCount, 0);
      if (cancelled) return;

      totalItemsRef.current = totalItems;
      nextStartIndexRef.current = initialBatchCount * 40;

      let workingItems = items;

      if (totalItems > 0 && totalItems < 10) {
        const fallbackQuery = buildFallbackQuery(prefs);
        debugLog("[GB] fallback query", fallbackQuery);
        const fallbackResult = await fetchBatches(fallbackQuery, initialBatchCount, 0);
        if (cancelled) return;
        activeQueryRef.current = fallbackQuery;
        totalItemsRef.current = fallbackResult.totalItems;
        nextStartIndexRef.current = initialBatchCount * 40;
        workingItems = fallbackResult.items;
      }

      const { normalized, swipedFiltered } = prepareBooks(workingItems, prefs?.length, swipedIds);
      const hasSwipedFiltered = swipedFiltered.length > 0;
      const nextBooks = hasSwipedFiltered ? swipedFiltered : normalized;
      const deduped = dedupeById(nextBooks);

      if (!cancelled) {
        setBooks(deduped.length ? deduped : BOOKS);
        setFilterSwiped(deduped.length ? hasSwipedFiltered : false);
        setIndex(0);
      }

      inFlightRef.current = false;
    };

    loadInitialPool().catch(() => {
      inFlightRef.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [prefs]);

  useEffect(() => {
    const maybeRefill = async () => {
      if (!prefs) return;
      if (inFlightRef.current) return;
      if (!activeQueryRef.current) return;

      const remaining = books.filter((book) => !swipedIds.has(book.id));
      if (remaining.length >= 30) return;

      if (totalItemsRef.current && nextStartIndexRef.current >= totalItemsRef.current) return;

      inFlightRef.current = true;
      const batchCount = 3;
      const startIndex = nextStartIndexRef.current;
      const { items, totalItems } = await fetchBatches(activeQueryRef.current, batchCount, startIndex);

      totalItemsRef.current = Math.max(totalItemsRef.current, totalItems);
      nextStartIndexRef.current += batchCount * 40;

      const { normalized, swipedFiltered } = prepareBooks(items, prefs?.length, swipedIds);
      const hasSwipedFiltered = swipedFiltered.length > 0;
      const incoming = hasSwipedFiltered ? swipedFiltered : normalized;
      const dedupedIncoming = dedupeById(incoming);

      if (!hasSwipedFiltered && remaining.length === 0 && normalized.length) {
        setFilterSwiped(false);
      }
      setBooks((prev) => dedupeById([...prev, ...dedupedIncoming]));
      inFlightRef.current = false;
    };

    maybeRefill().catch(() => {
      inFlightRef.current = false;
    });
  }, [books, prefs, swipedIds]);

  const activeBooks = books.length ? books : BOOKS;
  const remainingBooks = useMemo(() => {
    if (!filterSwiped) return activeBooks;
    return activeBooks.filter((book) => !swipedIds.has(book.id));
  }, [activeBooks, filterSwiped, swipedIds]);
  const topBook = useMemo(
    () => (remainingBooks.length ? remainingBooks[index % remainingBooks.length] : null),
    [remainingBooks, index]
  );
  const nextBook = useMemo(
    () => (remainingBooks.length ? remainingBooks[(index + 1) % remainingBooks.length] : null),
    [remainingBooks, index]
  );

  useEffect(() => {
    if (!remainingBooks.length) {
      setIndex(0);
      return;
    }
    if (index >= remainingBooks.length) {
      setIndex(0);
    }
  }, [index, remainingBooks.length]);

  const clearCleanupTimer = () => {
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  };

  const finishSwipe = () => {
    clearCleanupTimer();
    setOutgoing(null);
    setLocked(false);
  };

  const decide = (type) => {
    if (locked || !topBook) return;
    setLocked(true);

    const dir = type === "like" ? "right" : type === "dislike" ? "left" : "down";

    setOutgoing({ book: topBook, dir, phase: "start" });

    setSwipedIds((prev) => {
      const next = new Set(prev);
      next.add(topBook.id);
      localStorage.setItem(SWIPED_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });

    setIndex((prev) => prev + 1);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOutgoing((prev) => (prev ? { ...prev, phase: "go" } : prev));
      });
    });

    clearCleanupTimer();
    cleanupTimerRef.current = window.setTimeout(() => {
      finishSwipe();
    }, 320);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (locked) return;
      if (e.key === "ArrowRight") decide("like");
      if (e.key === "ArrowLeft") decide("dislike");
      if (e.key === "ArrowDown") decide("read");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, topBook]);

  const outgoingAnimClass = outgoing
    ? `outgoing ${outgoing.phase === "go" ? `swipe-${outgoing.dir}` : ""}`
    : "";

  return (
    <div className="swipe-page">
      <div className="deck">
        <div className="deck-stack deck-stack-1" aria-hidden="true" />
        <div className="deck-stack deck-stack-2" aria-hidden="true" />

        {nextBook && <Card book={nextBook} variant="next" animClass="" onDecide={decide} interactive={false} />}

        {topBook ? (
          <Card book={topBook} variant="top" animClass="" onDecide={decide} interactive={!locked} />
        ) : (
          <div className="deck-empty" role="status" aria-live="polite">
            Keine weiteren Bücher verfügbar.
          </div>
        )}

        {outgoing && (
          <div
            className="outgoing-layer"
            onTransitionEnd={(e) => {
              if (e.propertyName !== "transform") return;
              finishSwipe();
            }}
          >
            <Card
              book={outgoing.book}
              variant={outgoingAnimClass}
              animClass=""
              onDecide={() => {}}
              interactive={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
