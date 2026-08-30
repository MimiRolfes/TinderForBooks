import { useMemo, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import GuestTopbar from "../components/GuestTopbar";
import BottomNav from "../components/BottomNav";
import { usePageTheme } from "../hooks/usePageTheme";
import { GUEST_DECK } from "../data/guestDeck";
import { getSwipedIds, setSwipedIds, addLikedBook } from "../services/storageService";
import trashIcon from "../assets/icons/trash.png";
import checkIcon from "../assets/icons/check.png";
import "../styles/GuestSwipe.css";

const SWIPE_COMMIT = 90; // px drag distance that commits a save / skip

function GuestSwipe() {
  const { t } = useLanguage();
  usePageTheme("#2B2F33");

  const initialDeck = useMemo(() => {
    const seen = getSwipedIds();
    return GUEST_DECK.filter((b) => !seen.has(b.id));
  }, []);

  const [deck, setDeck] = useState(initialDeck);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const current = deck[0];

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
    setDeck(GUEST_DECK);
  };

  // ─── pointer drag (skip left / save right) ─────────────────────────────
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
        {current ? (
          <div className="gswipe-card-wrap">
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

              <img className="gswipe-cover" src={current.cover} alt="" draggable="false" />
              <h2 className="gswipe-book-title">{current.title}</h2>
              <p className="gswipe-book-author">
                {t("wishlist.by")} {current.author}
              </p>
              <p className="gswipe-claptext">{current.claptext}</p>
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
