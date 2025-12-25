import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";

const BOOKS = [
  { id: 1, title: "Book One", claptext: "This is a short claptext about the book.", cover: "/assets/Book.png" },
  { id: 2, title: "Book Two", claptext: "Another claptext describing the story.", cover: "/assets/Book.png" },
  { id: 3, title: "Book Three", claptext: "More text…", cover: "/assets/Book.png" },
  { id: 4, title: "Book Four", claptext: "More text…", cover: "/assets/Book.png" },
];

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

  // outgoing state split into 2 phases so transition reliably starts
  const [outgoing, setOutgoing] = useState(null);
  // outgoing: { book, dir: "right"|"left"|"down", phase: "start"|"go" }

  const cleanupTimerRef = useRef(null);

  const topBook = useMemo(() => BOOKS[index % BOOKS.length], [index]);
  const nextBook = useMemo(() => BOOKS[(index + 1) % BOOKS.length], [index]);

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
