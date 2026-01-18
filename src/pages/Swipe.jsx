import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";

const BOOKS = [
  { id: 1, title: "Book One", claptext: "This is a short claptext about the book.", cover: "/assets/Book.png" },
  { id: 2, title: "Book Two", claptext: "Another claptext describing the story.", cover: "/assets/Book.png" },
  { id: 3, title: "Book Three", claptext: "More text…", cover: "/assets/Book.png" },
  { id: 4, title: "Book Four", claptext: "More text…", cover: "/assets/Book.png" },
];

const FALLBACK_COVER = "/assets/Book.png";
const SWIPED_STORAGE_KEY = "tinderForBooks_swipedIds";

const buildQueryFromPrefs = (prefs) => {
  const parts = [];

  if (prefs?.genres?.length) {
    const subjectQuery = prefs.genres.map((g) => `subject:"${g}"`).join(" OR ");
    parts.push(`(${subjectQuery})`);
  }

  if (prefs?.author) {
    parts.push(`inauthor:"${prefs.author}"`);
  }

  return parts.length ? parts.join(" ") : "fiction";
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
  const [swipedIds, setSwipedIds] = useState(() => {
    const raw = localStorage.getItem(SWIPED_STORAGE_KEY);
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });

  
  const [outgoing, setOutgoing] = useState(null);
  

  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const prefsRaw = sessionStorage.getItem("tinderForBooks_preferences");
    const prefs = prefsRaw ? JSON.parse(prefsRaw) : null;

    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const query = buildQueryFromPrefs(prefs);
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "40");
    url.searchParams.set("orderBy", "relevance");
    if (apiKey) url.searchParams.set("key", apiKey);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const normalized = items.map(normalizeVolume);

        
        const filtered = normalized
          .filter((book) => matchesLength(book.pageCount, prefs?.length))
          .filter((book) => !swipedIds.has(book.id));

        if (filtered.length) {
          setBooks(filtered);
        } else if (normalized.length) {
          setBooks(normalized);
        }
      })
      .catch(() => {});
  }, [swipedIds]);

  const activeBooks = books.length ? books : BOOKS;
  const remainingBooks = useMemo(
    () => activeBooks.filter((book) => !swipedIds.has(book.id)),
    [activeBooks, swipedIds]
  );
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
