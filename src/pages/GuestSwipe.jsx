import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import GuestTopbar from "../components/GuestTopbar";
import BottomNav from "../components/BottomNav";
import { usePageTheme } from "../hooks/usePageTheme";
import { FALLBACK_DECK } from "../data/guestDeck";
import { fetchGuestDeck, hydrateBlurbs } from "../services/books";
import { getSwipedIds, setSwipedIds, addLikedBook, getPreferences } from "../services/storageService";
import trashIcon from "../assets/icons/trash.png";
import checkIcon from "../assets/icons/check.png";
import "../styles/GuestSwipe.css";

const SWIPE_COMMIT = 90; // px drag distance that commits a save / skip

function GuestSwipe() {
  const { t } = useLanguage();
  const location = useLocation();
  usePageTheme("#2B2F33");

  const genre = location.state?.genre || null;

  const [deck, setDeck] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const current = deck[0];

  // ─── load the deck (mount + restart) ──────────────────────────────────
  const load = useCallback(
    (signal) => {
      const seen = getSwipedIds();
      const unseen = (list) => list.filter((b) => !seen.has(b.id));

      return fetchGuestDeck({ genre, prefs: getPreferences(), signal })
        .then((books) => {
          if (signal?.aborted) return;
          const fresh = unseen(books);
          if (fresh.length) {
            setDeck(fresh);
            setStatus("ready");
          } else {
            setDeck(unseen(FALLBACK_DECK));
            setStatus(books.length ? "ready" : "error");
          }
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setDeck(unseen(FALLBACK_DECK));
          setStatus("error");
        });
    },
    [genre],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // Blurbs are slow on Open Library, so fetch them only for the visible card
  // and the next one, right when they're needed.
  useEffect(() => {
    const targets = deck.slice(0, 2).filter((b) => b.claptext === "");
    if (!targets.length) return;
    const ctrl = new AbortController();
    hydrateBlurbs(targets, ctrl.signal)
      .then((hydrated) => {
        const byId = new Map(hydrated.filter((b) => b.claptext).map((b) => [b.id, b]));
        if (byId.size) setDeck((d) => d.map((b) => byId.get(b.id) || b));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [deck]);

  // ─── actions ─────────────────────────────────────────────────────────
  const advance = (like) => {
    if (!current) return;
    const seen = getSwipedIds();
    seen.add(current.id);
    setSwipedIds(seen);
    if (like) addLikedBook(current);
    setDrag(0);
    setDragging(false);
    dragStart.current = null;
    setDeck((d) => d.slice(1));
  };

  const restart = () => {
    setSwipedIds(new Set());
    setStatus("loading");
    setDeck([]);
    load();
  };

  // ─── pointer drag (skip left / save right) ────────────────────────────
  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragStart.current == null) return;
    setDrag(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (dragStart.current == null) return;
    if (drag > SWIPE_COMMIT) advance(true);
    else if (drag < -SWIPE_COMMIT) advance(false);
    else {
      setDrag(0);
      setDragging(false);
      dragStart.current = null;
    }
  };

  return (
    <div className="gswipe">
      <GuestTopbar />

      <div className="gswipe-stage">
        {status === "loading" ? (
          <p className="gswipe-status">{t("swipe.loading")}</p>
        ) : current ? (
          <div className="gswipe-card-wrap">
            {status === "error" && <p className="gswipe-notice">{t("swipe.error")}</p>}

            <article
              className="gswipe-card"
              style={{
                transform: `translateX(${drag}px) rotate(${drag * 0.03}deg)`,
                transition: dragging ? "none" : "transform .25s ease",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <span className={`gswipe-flash save${drag > 40 ? " on" : ""}`}>
                {t("swipe.like")}
              </span>
              <span className={`gswipe-flash skip${drag < -40 ? " on" : ""}`}>
                {t("swipe.dislike")}
              </span>

              {current.cover ? (
                <img className="gswipe-cover" src={current.cover} alt="" draggable="false" />
              ) : (
                <span className="gswipe-cover gswipe-cover--empty" aria-hidden="true" />
              )}
              <h2 className="gswipe-book-title">{current.title}</h2>
              {current.author && (
                <p className="gswipe-book-author">
                  {t("wishlist.by")} {current.author}
                </p>
              )}
              <p className="gswipe-claptext">{current.claptext || "…"}</p>
            </article>

            <button
              type="button"
              className="gswipe-icon-btn skip"
              aria-label={t("swipe.dislike")}
              onClick={() => advance(false)}
            >
              <img src={trashIcon} alt="" />
            </button>
            <button
              type="button"
              className="gswipe-icon-btn save"
              aria-label={t("swipe.like")}
              onClick={() => advance(true)}
            >
              <img src={checkIcon} alt="" />
            </button>
          </div>
        ) : (
          <div className="gswipe-empty">
            <p className="gswipe-empty-title">{t("swipe.empty")}</p>
            <p className="gswipe-empty-hint">{t("swipe.emptyHint")}</p>
            <button type="button" className="gswipe-restart" onClick={restart}>
              {t("swipe.restart")}
            </button>
          </div>
        )}
      </div>

      <BottomNav active="swipe" />
    </div>
  );
}

export default GuestSwipe;
