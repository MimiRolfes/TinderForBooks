import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/PreferencesPage.css";

const GENRES = ["New Adult", "Horror", "Fantasy", "Dark Romance", "BookTok", "Romance"];
const LENGTHS = ["<100", "100-300", "300-500", ">500"];

function Preferences() {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLength, setSelectedLength] = useState("");
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
    // 1) Dein bestehendes Format (kannst du behalten)
    const prefsLegacy = {
      genres: selectedGenres,
      length: selectedLength,
      author: author.trim(),
    };
    sessionStorage.setItem("tinderForBooks_preferences", JSON.stringify(prefsLegacy));

    // 2) Format für Swipe.jsx (Google Books)
    // Google Books query: wir nehmen erstmal das ERSTE Genre als subject
    const { pagesMin, pagesMax } = lengthToPages(selectedLength);

    const prefsForSwipe = {
      genre: selectedGenres[0] || "", // subject:<genre>
      author: author.trim(),
      pagesMin,
      pagesMax,
    };

    sessionStorage.setItem("t4b_prefs", JSON.stringify(prefsForSwipe));

    navigate("/swipe");
  };

  return (
    <div className="preferences-container">
      <div className="preferences-inner">
        {step === 1 && (
          <>
            <h1 className="preferences-title">Choose your genres</h1>
            <section className="preferences-section">
              <h2>Pick one or more genres</h2>
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

            <button
              className="preferences-submit"
              onClick={() => setStep(2)}
              disabled={selectedGenres.length === 0}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="preferences-title">Choose a length</h1>
            <section className="preferences-section">
              <h2>How long should the book be?</h2>
              <div className="option-row">
                {LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    className={"option-chip" + (selectedLength === len ? " selected" : "")}
                    onClick={() => setSelectedLength(len)}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </section>

            <button
              className="preferences-submit"
              onClick={() => setStep(3)}
              disabled={!selectedLength}
            >
              Next
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="preferences-title">Any author you like?</h1>
            <section className="preferences-section">
              <h2>Optional: add an author</h2>
              <input
                className="author-input"
                type="text"
                placeholder="Type an author (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </section>

            <button className="preferences-submit" onClick={handleFinish}>
              Start swiping
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Preferences;
