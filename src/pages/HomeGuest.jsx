import { useLanguage } from "../contexts/LanguageContext";
import bookPlaceholder from "../assets/Book.png";
import "../styles/HomeGuest.css";

const decks = [
  { id: "dark-romance", title: "Dark Romance (De)", genre: "Dark Romance", colorClass: "deck-dark-romance" },
  { id: "romance", title: "Romance (De)", genre: "Romance", colorClass: "deck-romance" },
  { id: "fantasy", title: "Fantasy (De)", genre: "Fantasy", colorClass: "deck-fantasy" },
  { id: "horror", title: "Horror(De)", genre: "Horror", colorClass: "deck-horror" },
  { id: "romantasy", title: "Romantasy (De)", genre: "Romance/Fantasy", colorClass: "deck-romantasy" },
  { id: "dark", title: "Dark (De)", genre: "Dark Romance, Horror, Reverse Harem, Dark Thriller", colorClass: "deck-dark" },
  { id: "thriller-krimi", title: "Thriller/Krimi(De)", genre: "Thriller, Krimi", colorClass: "deck-thriller-krimi" },
];

function HomeGuest() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <div className="homeguest">
      <div className="homeguest-topbar">
        <span className="homeguest-guest-badge">*{t("nav.guest")}*</span>
        <button className="homeguest-lang-toggle" onClick={toggleLang} aria-label="Toggle language">
          <span className={lang === "en" ? "active" : ""}>en</span>
          <span className="sep">|</span>
          <span className={lang === "de" ? "active" : ""}>de</span>
        </button>
      </div>

      <h1 className="suggestions-title">{t("home.suggestionsTitle")}</h1>

      <div className="deck-list">
        {decks.map((deck) => (
          <section key={deck.id} className={`deck-card ${deck.colorClass}`}>
            <img className="deck-cover" src={bookPlaceholder} alt="" />
            <div className="deck-info">
              <h2 className="deck-title">{deck.title}</h2>
              <ul className="deck-meta">
                <li>{t("home.pagesLabel")} &lt; 500</li>
                <li>{t("home.genreLabel")}: {deck.genre}</li>
                <li>{t("home.languageLabel")}: Deutsch</li>
                <li>{t("home.authorLabel")}: {t("home.authorAll")}</li>
              </ul>
              <div className="deck-actions">
                <button className="deck-swipe-btn">{t("home.swipeButton")}</button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default HomeGuest;
