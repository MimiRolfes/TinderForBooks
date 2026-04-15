import { useEffect, useRef, useState } from "react";
import { fetchBooksForGenre } from "../services/booksApi";
import { usePreferences } from "./usePreferences";

const DEBUG = false;

const debugLog = (...args) => {
  if (DEBUG) console.log(...args);
};

const FALLBACK_BOOKS = [
  { id: 1, title: "Book One", author: "Author A", claptext: "Nice book", cover: "/assets/Book.png" },
  { id: 2, title: "Book Two", author: "Author B", claptext: "Another book", cover: "/assets/Book.png" },
  { id: 3, title: "Book Three", author: "Author C", claptext: "Good read", cover: "/assets/Book.png" },
  { id: 4, title: "Book Four", author: "Author D", claptext: "Interesting", cover: "/assets/Book.png" },
];

const matchesLength = (pageCount, length) => {
  if (!pageCount || !length) return true;
  if (length === "<100") return pageCount < 100;
  if (length === "100-300") return pageCount >= 100 && pageCount <= 300;
  if (length === "300-500") return pageCount >= 300 && pageCount <= 500;
  if (length === ">500") return pageCount > 500;
  return true;
};

const dedupeById = (items) => {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (!item?.id) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
};

const prepareBooks = (items, lengthPref, swipedSet) => {
  let lengthFiltered = items;
  if (lengthPref) {
    lengthFiltered = items.filter((book) => {
      if (!book.pageCount) return true;
      return matchesLength(book.pageCount, lengthPref);
    });
  }

  const basePool = lengthFiltered.length > 0 ? lengthFiltered : items;
  const swipedFiltered = basePool.filter((book) => !swipedSet.has(book.id));

  debugLog("[PREP] counts", {
    total: items.length,
    lengthFiltered: lengthFiltered.length,
    swipedFiltered: swipedFiltered.length,
  });

  return { normalized: items, swipedFiltered };
};

// swipedIds: aktuelle Set<string> aus Swipe.jsx — wird als Snapshot beim Laden genutzt
export function useBooks(swipedIds) {
  const { prefs } = usePreferences();
  const [books, setBooks] = useState(FALLBACK_BOOKS);
  const [filterSwiped, setFilterSwiped] = useState(false);
  const inFlightRef = useRef(false);

  // Bücher laden wenn sich Präferenzen ändern
  useEffect(() => {
    let cancelled = false;

    const loadBestsellers = async () => {
      inFlightRef.current = true;

      const genre = prefs?.genres?.[0] || "Romance";
      const enrichedBooks = await fetchBooksForGenre(genre);

      if (cancelled) return;

      if (enrichedBooks.length === 0) {
        console.error("No bestsellers found");
        setBooks(FALLBACK_BOOKS);
        inFlightRef.current = false;
        return;
      }

      // swipedIds wird hier als Snapshot aus dem Closure gelesen (intentional:
      // nur beim Laden gefiltert, nicht bei jeder Swipe-Interaktion)
      const { normalized, swipedFiltered } = prepareBooks(enrichedBooks, prefs?.length, swipedIds);
      const hasSwipedFiltered = swipedFiltered.length > 0;
      const nextBooks = hasSwipedFiltered ? swipedFiltered : normalized;
      const deduped = dedupeById(nextBooks);

      if (!cancelled) {
        setBooks(deduped.length ? deduped : FALLBACK_BOOKS);
        setFilterSwiped(deduped.length ? hasSwipedFiltered : false);
      }

      inFlightRef.current = false;
    };

    loadBestsellers().catch((error) => {
      console.error("Error loading bestsellers:", error);
      inFlightRef.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [prefs]); // swipedIds bewusst nicht in deps — Snapshot-Semantik

  return { books, filterSwiped };
}
