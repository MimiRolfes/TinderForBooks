import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";

const DEBUG = false;

const BOOKS = [
  { id: 1, title: "Book One", claptext: "This is a short claptext about the book.", cover: "/assets/Book.png" },
];

const FALLBACK_COVER = "/assets/Book.png";
const SWIPED_STORAGE_KEY = "tinderForBooks_swipedIds";
const LIKED_BOOKS_KEY = "tinderForBooks_likedBooks";
const READ_BOOKS_KEY = "tinderForBooks_readBooks";
const PREFS_STORAGE_KEY = "tinderForBooks_preferences";

// Genre zu NY Times Bestseller Listen Mapping
const NYT_BESTSELLER_LISTS = {
  Romance: "combined-print-and-e-book-fiction",
  Fantasy: "combined-print-and-e-book-fiction",
  Horror: "combined-print-and-e-book-fiction",
  "Dark Romance": "combined-print-and-e-book-fiction",
  "New Adult": "combined-print-and-e-book-fiction",
  BookTok: "combined-print-and-e-book-fiction",
};

const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

const matchesLength = (pageCount, length) => {
  if (!pageCount || !length) return true;
  if (length === "<100") return pageCount < 100;
  if (length === "100-300") return pageCount >= 100 && pageCount <= 300;
  if (length === "300-500") return pageCount >= 300 && pageCount <= 500;
  if (length === ">500") return pageCount > 500;
  return true;
};

const normalizeBook = (nytBook, googleBook = null) => {
  const isbn = nytBook.primary_isbn13 || nytBook.primary_isbn10;
  
  // Verwende Google Books Daten wenn verfügbar, sonst NY Times
  const cover = googleBook?.volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/, "https:") || 
                FALLBACK_COVER;
  
  const description = nytBook.description || 
                     googleBook?.volumeInfo?.description || 
                     "No description available.";
  
  const pageCount = googleBook?.volumeInfo?.pageCount || null;
  
  // Amazon Affiliate Link von NY Times
  const amazonLink = nytBook.amazon_product_url || 
                    (isbn ? `https://www.amazon.com/dp/${isbn}` : null);
  
  return {
    id: `nyt-${isbn || nytBook.rank}`,
    title: nytBook.title,
    author: nytBook.author,
    claptext: description,
    cover: cover,
    pageCount: pageCount,
    isbn: isbn,
    amazonLink: amazonLink,
    rank: nytBook.rank,
    weeksOnList: nytBook.weeks_on_list,
    publisher: nytBook.publisher,
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
          {book.author && <p className="author">by {book.author}</p>}
          <p>{book.claptext}</p>
        </div>

        <div className="actions">
          <button className="btn like" onClick={() => onDecide("like")} aria-label="Like">
            ❤
          </button>
          <button className="btn read" onClick={() => onDecide("read")} aria-label="Already read">
            ✓
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
  const inFlightRef = useRef(false);

  // NY Times Bestseller API
  const fetchNYTimesBestsellers = async (listName = "combined-print-and-e-book-fiction") => {
    const apiKey = import.meta.env.VITE_NYTIMES_API_KEY;
    const url = new URL(`https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json`);
    
    if (apiKey) {
      url.searchParams.set("api-key", apiKey);
    }

    debugLog("[NYT] request", url.toString());
    
    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.status === "OK" && data.results?.books) {
        debugLog("[NYT] response", {
          list: data.results.list_name,
          books: data.results.books.length,
        });
        return data.results.books;
      }
      
      return [];
    } catch (error) {
      console.error("[NYT] error:", error);
      return [];
    }
  };

  // Google Books API für zusätzliche Daten (Cover, Seitenzahl)
  const fetchGoogleBookByISBN = async (isbn) => {
    if (!isbn) return null;
    
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", `isbn:${isbn}`);
    
    if (apiKey) {
      url.searchParams.set("key", apiKey);
    }

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
      
      return null;
    } catch (error) {
      console.error("[GB] error:", error);
      return null;
    }
  };

  // Hole Google Books Daten für alle NY Times Bücher
  const enrichBooksWithGoogleData = async (nytBooks) => {
    const enrichedBooks = [];
    
    for (const nytBook of nytBooks) {
      const isbn = nytBook.primary_isbn13 || nytBook.primary_isbn10;
      const googleBook = await fetchGoogleBookByISBN(isbn);
      const normalized = normalizeBook(nytBook, googleBook);
      enrichedBooks.push(normalized);
      
      // Kleine Pause um API Rate Limits zu vermeiden
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return enrichedBooks;
  };

  const prepareBooks = (items, lengthPref, swipedSet) => {
    // Filtere nach Seitenzahl wenn Präferenz gesetzt ist
    let lengthFiltered = items;
    if (lengthPref) {
      lengthFiltered = items.filter((book) => {
        if (!book.pageCount) return true; // Behalte Bücher ohne Seitenangabe
        return matchesLength(book.pageCount, lengthPref);
      });
    }
    
    const basePool = lengthFiltered.length > 0 ? lengthFiltered : items;
    const swipedFiltered = basePool.filter((book) => !swipedSet.has(book.id));
    
    debugLog("[PREP] counts", {
      total: items.length,
      lengthFiltered: lengthFiltered.length,
      swipedFiltered: swipedFiltered.length,
    });
    
    return {
      normalized: items,
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
    let cancelled = false;

    const loadBestsellers = async () => {
      inFlightRef.current = true;

      // Hole die richtige Bestseller-Liste basierend auf Genre
      const genre = prefs?.genres?.[0] || "Romance";
      const listName = NYT_BESTSELLER_LISTS[genre] || "combined-print-and-e-book-fiction";
      
      debugLog("[INIT] Loading bestsellers for:", genre, listName);

      // 1. Hole NY Times Bestseller
      const nytBooks = await fetchNYTimesBestsellers(listName);
      
      if (cancelled) return;
      
      if (nytBooks.length === 0) {
        console.error("No bestsellers found");
        setBooks(BOOKS);
        inFlightRef.current = false;
        return;
      }

      // 2. Erweitere mit Google Books Daten
      const enrichedBooks = await enrichBooksWithGoogleData(nytBooks);
      
      if (cancelled) return;

      // 3. Filtere basierend auf Präferenzen
      const { normalized, swipedFiltered } = prepareBooks(enrichedBooks, prefs?.length, swipedIds);
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

    loadBestsellers().catch((error) => {
      console.error("Error loading bestsellers:", error);
      inFlightRef.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [prefs]);

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

    if (type === "like") {
      const likedRaw = localStorage.getItem(LIKED_BOOKS_KEY);
      let likedBooks = [];
      try {
        likedBooks = likedRaw ? JSON.parse(likedRaw) : [];
      } catch (error) {
        console.error("Error loading liked books:", error);
        likedBooks = [];
      }
      
      const alreadyLiked = likedBooks.some(book => book.id === topBook.id);
      if (!alreadyLiked) {
        likedBooks.push(topBook);
        localStorage.setItem(LIKED_BOOKS_KEY, JSON.stringify(likedBooks));
      }
    }

    if (type === "read") {
      const readRaw = localStorage.getItem(READ_BOOKS_KEY);
      let readBooks = [];
      try {
        readBooks = readRaw ? JSON.parse(readRaw) : [];
      } catch (error) {
        console.error("Error loading read books:", error);
        readBooks = [];
      }
      
      const alreadyRead = readBooks.some(book => book.id === topBook.id);
      if (!alreadyRead) {
        readBooks.push(topBook);
        localStorage.setItem(READ_BOOKS_KEY, JSON.stringify(readBooks));
      }
    }

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