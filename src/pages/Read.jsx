import { useState, useEffect } from "react";
import "../styles/Read.css";
import {
  STORAGE_KEYS,
  getReadBooks,
  setReadBooks as saveReadBooks,
  clearReadBooks,
} from "../services/storageService";
import { useLanguage } from "../contexts/LanguageContext";

function Read() {
  const [readBooks, setReadBooks] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadReadBooks = () => {
      setReadBooks(getReadBooks());
    };

    loadReadBooks();

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.READ_BOOKS) {
        loadReadBooks();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromRead = (bookId) => {
    const updated = readBooks.filter((book) => book.id !== bookId);
    setReadBooks(updated);
    saveReadBooks(updated);
  };

  const clearRead = () => {
    if (window.confirm(t("read.confirmClear"))) {
      setReadBooks([]);
      clearReadBooks();
    }
  };

  const countLabel =
    readBooks.length === 1
      ? t("read.countSingular")
      : t("read.countPlural").replace("{n}", readBooks.length);

  return (
    <div className="read-container">
      <div className="read-header">
        <h1 className="read-title">{t("read.title")}</h1>
        {readBooks.length > 0 && (
          <button className="clear-button" onClick={clearRead}>
            {t("read.clearAll")}
          </button>
        )}
      </div>

      {readBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">{t("read.empty")}</p>
          <p className="empty-hint">{t("read.emptyHint")}</p>
        </div>
      ) : (
        <div className="books-grid">
          {readBooks.map((book) => (
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
                <p className="book-description">
                  {book.claptext
                    ? book.claptext.length > 150
                      ? `${book.claptext.substring(0, 150)}…`
                      : book.claptext
                    : ""}
                </p>
              </div>

              <button
                className="remove-button"
                onClick={() => removeFromRead(book.id)}
                aria-label={`Remove ${book.title}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="read-count">{countLabel}</div>
    </div>
  );
}

export default Read;
