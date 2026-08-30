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
const EXIT_MS = 360; // fly-off animation length — keep in sync with the CSS

function GuestSwipe() {
  const { t } = useLanguage();
  const location = useLocation();
  usePageTheme("#2B2F33");

  const genre = location.state?.genre || null;

  const [deck, setDeck] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState(null); // null | "like" | "skip"
  const dragStart = useRef(null);
  const exitTimer = useRef(null);

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

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

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
  // Fly the card off screen, persist the decision, then drop it from the deck.
  const advance = (like) => {
    if (!current || exiting) return;
    const seen = getSwipedIds();
    seen.add(current.id);
    setSwipedIds(seen);
    if (like) addLikedBook(current);
    setDragging(false);
    dragStart.current = null;
    setExiting(like ? "like" : "skip");
    exitTimer.current = window.setTimeout(() => {
      setExiting(null);
      setDrag(0);
      setDeck((d) => d.slice(1));
    }, EXIT_MS);
  };

  const restart = () => {
    window.clearTimeout(exitTimer.current);
    setExiting(null);
    setDrag(0);
    setSwipedIds(new Set());
    setStatus("loading");
    setDeck([]);
    load();
  };

  // ─── pointer drag (skip left / save right) ────────────────────────────
  const onPointerDown = (e) => {
    if (exiting) return;
    dragStart.current = e.clientX;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore — not all pointer types support capture */
    }
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

  const exitDir = exiting === "like" ? 1 : exiting === "skip" ? -1 : 0;
  const cardStyle = exiting
    ? {
        transform: `translateX(${exitDir * 115}vw) rotate(${exitDir * 16}deg)`,
        transition: `transform ${EXIT_MS}ms ease-out`,
      }
    : {
        transform: `translateX(${drag}px) rotate(${drag * 0.03}deg)`,
        transition: dragging ? "none" : "transform .25s ease",
      };

  // as the card is dragged toward one side, grow that action's icon and
  // fade the other so the outcome is obvious
  const bias = exiting
    ? exitDir
    : Math.max(-1, Math.min(1, drag / SWIPE_COMMIT));
  const skipIconStyle = {
    transform: `scale(${1 + Math.max(0, -bias) * 0.22})`,
    opacity: 1 - Math.max(0, bias) * 0.6,
  };
  const saveIconStyle = {
    transform: `scale(${1 + Math.max(0, bias) * 0.22})`,
    opacity: 1 - Math.max(0, -bias) * 0.6,
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

            <div className="gswipe-card-anim" key={current.id}>
              <article
                className="gswipe-card"
                style={cardStyle}
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
                style={skipIconStyle}
                aria-label={t("swipe.dislike")}
                onClick={() => advance(false)}
              >
                <img src={trashIcon} alt="" />
              </button>
              <button
                type="button"
                className="gswipe-icon-btn save"
                style={saveIconStyle}
                aria-label={t("swipe.like")}
                onClick={() => advance(true)}
              >
                <img src={checkIcon} alt="" />
              </button>
            </div>
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
