const DEBUG = false;

const debugLog = (...args) => {
  if (DEBUG) console.log(...args);
};

const FALLBACK_COVER = "/assets/Book.png";

// Genre → NY Times Bestseller Listen Mapping
const NYT_BESTSELLER_LISTS = {
  Romance: "combined-print-and-e-book-fiction",
  Fantasy: "combined-print-and-e-book-fiction",
  Horror: "combined-print-and-e-book-fiction",
  "Dark Romance": "combined-print-and-e-book-fiction",
  "New Adult": "combined-print-and-e-book-fiction",
  BookTok: "combined-print-and-e-book-fiction",
};

const normalizeBook = (nytBook, googleBook = null) => {
  const isbn = nytBook.primary_isbn13 || nytBook.primary_isbn10;

  const cover =
    googleBook?.volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/, "https:") ||
    FALLBACK_COVER;

  const description =
    nytBook.description ||
    googleBook?.volumeInfo?.description ||
    "No description available.";

  const pageCount = googleBook?.volumeInfo?.pageCount || null;

  const amazonLink =
    nytBook.amazon_product_url ||
    (isbn ? `https://www.amazon.com/dp/${isbn}` : null);

  return {
    id: `nyt-${isbn || nytBook.rank}`,
    title: nytBook.title,
    author: nytBook.author,
    claptext: description,
    cover,
    pageCount,
    isbn,
    amazonLink,
    rank: nytBook.rank,
    weeksOnList: nytBook.weeks_on_list,
    publisher: nytBook.publisher,
  };
};

const fetchNYTimesBestsellers = async (listName = "combined-print-and-e-book-fiction") => {
  const apiKey = import.meta.env.VITE_NYTIMES_API_KEY;
  const url = new URL(`https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json`);

  if (apiKey) {
    url.searchParams.set("api-key", apiKey);
  }

  debugLog("[NYT] request", url.toString());

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && data.results?.books) {
      debugLog("[NYT] response", {
        list: data.results.list_name,
        books: data.results.books.length,
      });
      return data.results.books;
    }

    return [];
  } catch (error) {
    console.error("[NYT] error:", error);
    return [];
  }
};

const fetchGoogleBookByISBN = async (isbn) => {
  if (!isbn) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", `isbn:${isbn}`);

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;
  } catch (error) {
    console.error("[GB] error:", error);
    return null;
  }
};

const enrichBooksWithGoogleData = async (nytBooks) => {
  const enrichedBooks = [];

  for (const nytBook of nytBooks) {
    const isbn = nytBook.primary_isbn13 || nytBook.primary_isbn10;
    const googleBook = await fetchGoogleBookByISBN(isbn);
    enrichedBooks.push(normalizeBook(nytBook, googleBook));

    // Kleine Pause um API Rate Limits zu vermeiden
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return enrichedBooks;
};

// Öffentliche API: lädt und normalisiert Bücher für ein Genre
export const fetchBooksForGenre = async (genre = "Romance") => {
  const listName = NYT_BESTSELLER_LISTS[genre] || "combined-print-and-e-book-fiction";
  debugLog("[INIT] Loading bestsellers for:", genre, listName);

  const nytBooks = await fetchNYTimesBestsellers(listName);
  if (nytBooks.length === 0) return [];

  return await enrichBooksWithGoogleData(nytBooks);
};
