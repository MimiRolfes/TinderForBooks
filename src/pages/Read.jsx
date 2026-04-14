import { useState, useEffect } from "react";
import "../styles/Read.css";
import {
  STORAGE_KEYS,
  getReadBooks,
  setReadBooks as saveReadBooks,
  clearReadBooks,
} from "../services/storageService";

function Read() {
  const [readBooks, setReadBooks] = useState([]);

  useEffect(() => {
    const loadReadBooks = () => {
      setReadBooks(getReadBooks());
    };

    loadReadBooks();

    // Storage event listener für Updates von anderen Tabs
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
    if (window.confirm("Möchtest du wirklich alle Bücher aus deiner 'Already Read' Liste entfernen?")) {
      setReadBooks([]);
      clearReadBooks();
    }
  };

  return (
    <div className="read-container">
      <div className="read-header">
        <h1 className="read-title">Already Read</h1>
        {readBooks.length > 0 && (
          <button className="clear-button" onClick={clearRead}>
            Clear All
          </button>
        )}
      </div>

      {readBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">You haven't marked any books as read yet.</p>
          <p className="empty-hint">Swipe down on books you've already read to add them here!</p>
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
                  {book.claptext.length > 150 
                    ? `${book.claptext.substring(0, 150)}...` 
                    : book.claptext}
                </p>
              </div>

              <button 
                className="remove-button" 
                onClick={() => removeFromRead(book.id)}
                aria-label={`Remove ${book.title} from read list`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="read-count">
        {readBooks.length} {readBooks.length === 1 ? "book" : "books"} you've already read
      </div>
    </div>
  );
}

export default Read;