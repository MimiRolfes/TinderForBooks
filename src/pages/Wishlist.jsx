import { useState, useEffect } from "react";
import "../styles/Wishlist.css";
import {
  STORAGE_KEYS,
  getLikedBooks,
  setLikedBooks as saveLikedBooks,
  clearLikedBooks,
} from "../services/storageService";

function Wishlist() {
  const [likedBooks, setLikedBooks] = useState([]);

  useEffect(() => {
    const loadLikedBooks = () => {
      setLikedBooks(getLikedBooks());
    };

    loadLikedBooks();

    // Storage event listener für Updates von anderen Tabs
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.LIKED_BOOKS) {
        loadLikedBooks();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromWishlist = (bookId) => {
    const updated = likedBooks.filter((book) => book.id !== bookId);
    setLikedBooks(updated);
    saveLikedBooks(updated);
  };

  const clearWishlist = () => {
    if (window.confirm("Möchtest du wirklich alle Bücher aus deiner Wishlist entfernen?")) {
      setLikedBooks([]);
      clearLikedBooks();
    }
  };

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1 className="wishlist-title">Your Wishlist</h1>
        {likedBooks.length > 0 && (
          <button className="clear-button" onClick={clearWishlist}>
            Clear All
          </button>
        )}
      </div>

      {likedBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">Your wishlist is empty.</p>
          <p className="empty-hint">Swipe right on books you like to add them here!</p>
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
                {book.author && <p className="book-author">by {book.author}</p>}
                <p className="book-description">
                  {book.claptext.length > 150 
                    ? `${book.claptext.substring(0, 150)}...` 
                    : book.claptext}
                </p>
                
                {book.amazonLink && (
                  <a 
                    href={book.amazonLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="buy-link amazon-link"
                  >
                    📚 Buy on Amazon
                  </a>
                )}
              </div>

              <button 
                className="remove-button" 
                onClick={() => removeFromWishlist(book.id)}
                aria-label={`Remove ${book.title} from wishlist`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="wishlist-count">
        {likedBooks.length} {likedBooks.length === 1 ? "book" : "books"} in your wishlist
      </div>
    </div>
  );
}

export default Wishlist;