import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SwipePage.css";
import { getSwipedIds, setSwipedIds, addLikedBook, addReadBook } from "../services/storageService";
import { useBooks } from "../hooks/useBooks";
import { saveLikedBook } from "../services/supabaseClient";
import { useLanguage } from "../contexts/LanguageContext";

function Card({ book, variant, animClass, onDecide, interactive }) {
  const { t } = useLanguage();

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
          <button className="btn like" onClick={() => onDecide("like")} aria-label={t("swipe.like")}>
            ❤
            <span className="btn-label">{t("swipe.like")}</span>
          </button>
          <button className="btn read" onClick={() => onDecide("read")} aria-label={t("swipe.read")}>
            ✓
            <span className="btn-label">{t("swipe.read")}</span>
          </button>
          <button className="btn dislike" onClick={() => onDecide("dislike")} aria-label={t("swipe.dislike")}>
            👎
            <span className="btn-label">{t("swipe.dislike")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Swipe() {
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [swipedIds, setSwipedIdsState] = useState(() => getSwipedIds());
  const [outgoing, setOutgoing] = useState(null);
  const { t } = useLanguage();

  const cleanupTimerRef = useRef(null);

  const { books, filterSwiped } = useBooks(swipedIds);

  const remainingBooks = useMemo(() => {
    if (!filterSwiped) return books;
    return books.filter((book) => !swipedIds.has(book.id));
  }, [books, filterSwiped, swipedIds]);

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
      addLikedBook(topBook);
      saveLikedBook(topBook);
    }

    if (type === "read") {
      addReadBook(topBook);
    }

    setSwipedIdsState((prev) => {
      const next = new Set(prev);
      next.add(topBook.id);
      setSwipedIds(next);
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
            {t("swipe.empty")}
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
