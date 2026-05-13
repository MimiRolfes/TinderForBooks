import { removeLikedBookFromSupabase } from "../services/supabaseClient";
import { getLikedBooksFromSupabase } from "../services/supabaseClient";
import { useState, useEffect } from "react";
import "../styles/Wishlist.css";
import {
  STORAGE_KEYS,
  clearLikedBooks,
} from "../services/storageService";
import { useLanguage } from "../contexts/LanguageContext";

function Wishlist() {
  const [likedBooks, setLikedBooks] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadLikedBooks = async () => {
      const data = await getLikedBooksFromSupabase();
      console.log("WISHLIST DATA:", data);
      setLikedBooks(data);
    };

    loadLikedBooks();

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.LIKED_BOOKS) {
        loadLikedBooks();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromWishlist = async (bookId) => {
    const success = await removeLikedBookFromSupabase(bookId);
    if (!success) return;
    setLikedBooks(likedBooks.filter((book) => book.id !== bookId));
  };

  const clearWishlist = () => {
    if (window.confirm(t("wishlist.confirmClear"))) {
      setLikedBooks([]);
      clearLikedBooks();
    }
  };

  const countLabel =
    likedBooks.length === 1
      ? t("wishlist.countSingular")
      : t("wishlist.countPlural").replace("{n}", likedBooks.length);

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1 className="wishlist-title">{t("wishlist.title")}</h1>
        {likedBooks.length > 0 && (
          <button className="clear-button" onClick={clearWishlist}>
            {t("wishlist.clearAll")}
          </button>
        )}
      </div>

      {likedBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">{t("wishlist.empty")}</p>
          <p className="empty-hint">{t("wishlist.emptyHint")}</p>
        </div>
      ) : (
        <div className="books-grid">
          {likedBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover-container">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="book-cover-img"
                />
              </div>

              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                {book.author && (
                  <p className="book-author">{t("wishlist.by")} {book.author}</p>
                )}
                <p className="book-description">
                  {book.claptext
                    ? book.claptext.length > 150
                      ? `${book.claptext.substring(0, 150)}…`
                      : book.claptext
                    : t("wishlist.noDescription")}
                </p>

                {book.amazonLink && (
                  <a
                    href={book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-link amazon-link"
                  >
                    {t("wishlist.buyOnAmazon")}
                  </a>
                )}
              </div>

              <button
                className="remove-button"
                onClick={() => removeFromWishlist(book.id)}
                aria-label={`Remove ${book.title}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="wishlist-count">{countLabel}</div>
    </div>
  );
}

export default Wishlist;
