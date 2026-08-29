import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import BottomNav from "../components/BottomNav";
import LangToggle from "../components/LangToggle";
import "../styles/GuestPreferences.css";

const GENRES = [
  "Fantasy",
  "Dark Romance",
  "Romance",
  "Horror",
  "Thriller",
  "Romantasy",
  "Dark Reverse Harem",
];

const PAGE_OPTIONS = ["<100", "<350", "<500", ">500"];
const LANGUAGES = ["Deutsch", "English"];

function GuestPreferences() {
  const { t } = useLanguage();

  const [genres, setGenres] = useState([]);
  const [pages, setPages] = useState(null);
  const [language, setLanguage] = useState(null);
  const [author, setAuthor] = useState("");

  const toggleGenre = (g) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  return (
    <div className="prefs">
      <header className="prefs-topbar">
        <span className="prefs-guest-badge">*{t("nav.guest")}*</span>
        <LangToggle className="prefs-lang-toggle" />
      </header>

      <section className="prefs-section">
        <h2 className="prefs-heading">{t("guestPrefs.genre")}</h2>
        <div className="prefs-chips">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              className={`prefs-chip${genres.includes(g) ? " selected" : ""}`}
              aria-pressed={genres.includes(g)}
              onClick={() => toggleGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      <section className="prefs-section">
        <h2 className="prefs-heading">{t("guestPrefs.pages")}</h2>
        <div className="prefs-radios" role="radiogroup" aria-label={t("guestPrefs.pages")}>
          {PAGE_OPTIONS.map((opt) => (
            <label key={opt} className="prefs-radio">
              <input
                type="radio"
                name="pages"
                value={opt}
                checked={pages === opt}
                onChange={() => setPages(opt)}
              />
              <span className="prefs-radio-dot" />
              <span className="prefs-radio-label">{opt}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="prefs-section">
        <h2 className="prefs-heading">{t("guestPrefs.language")}</h2>
        <div className="prefs-chips">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              className={`prefs-chip prefs-chip-lang${language === l ? " selected" : ""}`}
              aria-pressed={language === l}
              onClick={() => setLanguage((prev) => (prev === l ? null : l))}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className="prefs-section">
        <h2 className="prefs-heading">{t("guestPrefs.author")}</h2>
        <input
          className="prefs-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t("guestPrefs.authorPlaceholder")}
        />
      </section>

      <div className="prefs-actions">
        {/* Discover / Swipe screen not implemented yet */}
        <button type="button" className="prefs-swipe-btn">
          {t("guestPrefs.submit")}
        </button>
      </div>

      <BottomNav active="preferences" />
    </div>
  );
}

export default GuestPreferences;
