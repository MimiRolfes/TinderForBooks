console.log("API KEY:", import.meta.env.VITE_GOOGLE_BOOKS_API_KEY);


function pickIsbn(industryIdentifiers = []) {
  const isbn13 = industryIdentifiers.find((x) => x.type === "ISBN_13")?.identifier;
  const isbn10 = industryIdentifiers.find((x) => x.type === "ISBN_10")?.identifier;
  return isbn13 || isbn10 || null;
}

function normalizeVolume(item) {
  const v = item.volumeInfo || {};
  const title = v.title || "Untitled";
  const authors = Array.isArray(v.authors) ? v.authors : [];
  const pageCount = typeof v.pageCount === "number" ? v.pageCount : null;
  const description = v.description || "";
  const isbn = pickIsbn(v.industryIdentifiers);

  const thumbnail =
    v.imageLinks?.thumbnail ||
    v.imageLinks?.smallThumbnail ||
    "";

  return {
    id: item.id,
    title,
    authors,
    author: authors[0] || "",
    pageCount,
    description,
    isbn,
    coverUrl: thumbnail ? thumbnail.replace("http://", "https://") : "",
  };
}

async function callGoogleBooks({ q, maxResults, startIndex, signal }) {
  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${encodeURIComponent(q)}` +
    `&printType=books` +
    `&orderBy=relevance` +
    `&maxResults=${maxResults}` +
    `&startIndex=${startIndex}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Google Books error: ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map(normalizeVolume);
}


export async function fetchBooks({
  genre,
  author,
  pagesMin,
  pagesMax,
  maxResults = 20,
  startIndex = 0,
  signal,
}) {
  const safeGenre = (genre || "").trim();
  const safeAuthor = (author || "").trim();

  const strictParts = [];
  if (safeGenre) strictParts.push(`subject:"${safeGenre}"`);
  if (safeAuthor) strictParts.push(`inauthor:"${safeAuthor}"`);
  if (strictParts.length === 0) strictParts.push("books");
  const strictQ = strictParts.join(" ");

  let books = await callGoogleBooks({ q: strictQ, maxResults, startIndex, signal });

  if (books.length === 0) {
    const looseParts = [];
    if (safeGenre) looseParts.push(`"${safeGenre}"`);
    if (safeAuthor) looseParts.push(`inauthor:"${safeAuthor}"`);
    if (looseParts.length === 0) looseParts.push("books");
    const looseQ = looseParts.join(" ");
    books = await callGoogleBooks({ q: looseQ, maxResults, startIndex, signal });
  }

  if (pagesMin != null) books = books.filter((b) => b.pageCount == null || b.pageCount >= pagesMin);
  if (pagesMax != null) books = books.filter((b) => b.pageCount == null || b.pageCount <= pagesMax);

  books.sort((a, b) => {
    const score = (x) => (x.coverUrl ? 2 : 0) + (x.description ? 2 : 0) + (x.pageCount ? 1 : 0);
    return score(b) - score(a);
  });

  return books;
}
