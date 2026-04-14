import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/PreferencesPage.css";
import { setPreferences } from "../services/storageService";

const GENRES = ["New Adult", "Horror", "Fantasy", "Dark Romance", "BookTok", "Romance"];
const LENGTHS = ["<100", "100-300", "300-500", ">500"];
const LANGUAGES = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" }
];

function Preferences() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [author, setAuthor] = useState("");

  const navigate = useNavigate();

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const lengthToPages = (len) => {
    if (len === "<100") return { pagesMin: null, pagesMax: 99 };
    if (len === "100-300") return { pagesMin: 100, pagesMax: 300 };
    if (len === "300-500") return { pagesMin: 300, pagesMax: 500 };
    if (len === ">500") return { pagesMin: 501, pagesMax: null };
    return { pagesMin: null, pagesMax: null };
  };

  const handleFinish = () => {
    const { pagesMin, pagesMax } = lengthToPages(selectedLength);

    setPreferences({
      genres: selectedGenres,
      length: selectedLength,
      language: selectedLanguage,
      author: author.trim(),
      pagesMin,
      pagesMax,
    });

    navigate("/swipe");
  };

  const isFormValid = selectedGenres.length > 0 && selectedLength && selectedLanguage;

  return (
    <div className="preferences-container">
      <div className="preferences-inner">
        <h1 className="preferences-title">Set your preferences</h1>

        <section className="preferences-section">
          <h2>Choose your genres</h2>
          <p className="section-description">Pick one or more genres</p>
          <div className="option-row">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                className={"option-chip" + (selectedGenres.includes(g) ? " selected" : "")}
                onClick={() => toggleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section className="preferences-section">
          <h2>Choose a length</h2>
          <p className="section-description">How long should the book be?</p>
          <div className="option-row">
            {LENGTHS.map((len) => (
              <button
                key={len}
                type="button"
                className={"option-chip" + (selectedLength === len ? " selected" : "")}
                onClick={() => setSelectedLength(len)}
              >
                {len} pages
              </button>
            ))}
          </div>
        </section>

        <section className="preferences-section">
          <h2>Choose a language</h2>
          <p className="section-description">Which language do you prefer?</p>
          <div className="option-row">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={"option-chip" + (selectedLanguage === lang.code ? " selected" : "")}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </section>

        <section className="preferences-section">
          <h2>Any favorite author?</h2>
          <p className="section-description">Optional: add an author name</p>
          <input
            className="author-input"
            type="text"
            placeholder="Type an author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </section>

        <button 
          className="preferences-submit" 
          onClick={handleFinish}
          disabled={!isFormValid}
        >
          Start swiping
        </button>
      </div>
    </div>
  );
}

export default Preferences;