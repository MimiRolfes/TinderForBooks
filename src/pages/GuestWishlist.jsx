import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import GuestTopbar from "../components/GuestTopbar";
import BottomNav from "../components/BottomNav";
import { usePageTheme } from "../hooks/usePageTheme";
import { getLikedBooks, setLikedBooks } from "../services/storageService";
import closeIcon from "../assets/icons/close.png";
import cartIcon from "../assets/icons/cart.png";
import "../styles/GuestWishlist.css";

function GuestWishlist() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  usePageTheme("#2B2F33");

  const [books, setBooks] = useState(() => getLikedBooks());

  const remove = (id) => {
    const next = books.filter((b) => b.id !== id);
    setLikedBooks(next);
    setBooks(next);
  };

  // No real checkout yet — open an Amazon search for the whole wishlist.
  const openCart = () => {
    if (books.length === 0) return;
    const q = books.map((b) => b.title).join(" ");
    window.open(`https://www.amazon.de/s?k=${encodeURIComponent(q)}`, "_blank", "noopener");
  };

  return (
    <div className="gwish">
      <GuestTopbar />

      {books.length === 0 ? (
        <div className="gwish-empty">
          <p className="gwish-empty-title">{t("wishlist.empty")}</p>
          <p className="gwish-empty-hint">{t("wishlist.emptyHint")}</p>
          <button
            type="button"
            className="gwish-cta"
            onClick={() => navigate("/guest-swipe")}
          >
            {t("wishlist.goSwipe")}
          </button>
        </div>
      ) : (
        <>
          <ul className="gwish-grid">
            {books.map((book) => (
              <li key={book.id} className="gwish-card">
                <img className="gwish-cover" src={book.cover} alt="" />
                <h2 className="gwish-book-title">{book.title}</h2>
                <div className="gwish-card-actions">
                  <button
                    type="button"
                    className="gwish-icon-btn"
                    aria-label={t("wishlist.remove")}
                    onClick={() => remove(book.id)}
                  >
                    <img src={closeIcon} alt="" />
                  </button>
                  {book.amazonLink && (
                    <a
                      className="gwish-icon-btn"
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("wishlist.buyOnAmazon")}
                    >
                      <img src={cartIcon} alt="" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <button type="button" className="gwish-cart" onClick={openCart}>
            {t("wishlist.cart")}
          </button>
        </>
      )}

      <BottomNav active="wishlist" />
    </div>
  );
}

export default GuestWishlist;
