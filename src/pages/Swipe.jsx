import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";

const BOOKS = [
  { id: 1, title: "Book One", claptext: "This is a short claptext about the book.", cover: "/assets/Book.png" },
  { id: 2, title: "Book Two", claptext: "Another claptext describing the story.", cover: "/assets/Book.png" },
  { id: 3, title: "Book Three", claptext: "More text…", cover: "/assets/Book.png" },
  { id: 4, title: "Book Four", claptext: "More text…", cover: "/assets/Book.png" },
];

const FALLBACK_COVER = "/assets/Book.png";

const buildQueryFromPrefs = (prefs) => {
  const parts = [];

  if (prefs?.genres?.length) {
    const subjectQuery = prefs.genres.map((g) => `subject:${g}`).join(" OR ");
    parts.push(`(${subjectQuery})`);
  }

  if (prefs?.author) {
    parts.push(`inauthor:${prefs.author}`);
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
  return {
    id: volume.id || `book-${index}`,
    title: info.title || "Untitled",
    claptext: info.description || "No description available.",
    cover: info.imageLinks?.thumbnail || FALLBACK_COVER,
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

  // outgoing state split into 2 phases so transition reliably starts
  const [outgoing, setOutgoing] = useState(null);
  // outgoing: { book, dir: "right"|"left"|"down", phase: "start"|"go" }

  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const prefsRaw = sessionStorage.getItem("tinderForBooks_preferences");
    const prefs = prefsRaw ? JSON.parse(prefsRaw) : null;

    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    const query = buildQueryFromPrefs(prefs);
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "20");
    if (apiKey) url.searchParams.set("key", apiKey);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const normalized = items.map(normalizeVolume);
        const filtered = normalized.filter((book) => matchesLength(book.pageCount, prefs?.length));
        if (filtered.length) {
          setBooks(filtered);
        } else if (normalized.length) {
          setBooks(normalized);
        }
      })
      .catch(() => {});
  }, []);

  const activeBooks = books.length ? books : BOOKS;
  const topBook = useMemo(() => activeBooks[index % activeBooks.length], [activeBooks, index]);
  const nextBook = useMemo(() => activeBooks[(index + 1) % activeBooks.length], [activeBooks, index]);

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
    if (locked) return;
    setLocked(true);

    const dir = type === "like" ? "right" : type === "dislike" ? "left" : "down";

    // 1) Freeze current card as outgoing in "start" phase (no movement yet)
    setOutgoing({ book: topBook, dir, phase: "start" });

    // 2) Advance deck immediately so next card is already underneath
    setIndex((prev) => prev + 1);

    // 3) Next frame: switch to "go" to trigger CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOutgoing((prev) => (prev ? { ...prev, phase: "go" } : prev));
      });
    });

    // 4) Fallback cleanup in case transitionend doesn't fire
    clearCleanupTimer();
    cleanupTimerRef.current = window.setTimeout(() => {
      finishSwipe();
    }, 320);
  };

  // keyboard support
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
        {/* Background peek */}
        <div className="deck-stack deck-stack-1" aria-hidden="true" />
        <div className="deck-stack deck-stack-2" aria-hidden="true" />

        {/* Under/Next */}
        <Card book={nextBook} variant="next" animClass="" onDecide={decide} interactive={false} />

        {/* Current Top (interactive when not locked) */}
        <Card book={topBook} variant="top" animClass="" onDecide={decide} interactive={!locked} />

        {/* Outgoing copy */}
        {outgoing && (
          <div
            className="outgoing-layer"
            onTransitionEnd={(e) => {
              // make sure we only react to the transform transition on the outgoing card
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
