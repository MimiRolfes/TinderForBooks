import { useLanguage } from "../contexts/LanguageContext";
import BottomNav from "../components/BottomNav";
import LangToggle from "../components/LangToggle";
import coverDarkRomance from "../assets/covers/dark-romance.jpg";
import coverRomance from "../assets/covers/romance.jpg";
import coverFourthWing from "../assets/covers/fourth-wing.jpg";
import coverBlackwood from "../assets/covers/blackwood-institute.jpg";
import coverMimik from "../assets/covers/mimik.jpg";
import "../styles/HomeGuest.css";

const decks = [
  { id: "dark-romance", title: "Dark Romance (De)", genre: "Dark Romance", colorClass: "deck-dark-romance", cover: coverDarkRomance },
  { id: "romance", title: "Romance (De)", genre: "Romance", colorClass: "deck-romance", cover: coverRomance },
  { id: "fantasy", title: "Fantasy (De)", genre: "Fantasy", colorClass: "deck-fantasy", cover: coverFourthWing },
  { id: "horror", title: "Horror (De)", genre: "Horror", colorClass: "deck-horror", cover: coverBlackwood },
  { id: "romantasy", title: "Romantasy (De)", genre: "Romance/Fantasy", colorClass: "deck-romantasy", cover: coverFourthWing },
  { id: "dark", title: "Dark (De)", genre: "Dark Romance, Horror, Reverse Harem, Dark Thriller", colorClass: "deck-dark", cover: coverBlackwood },
  { id: "thriller-krimi", title: "Thriller/Krimi (De)", genre: "Thriller, Krimi", colorClass: "deck-thriller-krimi", cover: coverMimik },
];

function HomeGuest() {
  const { t } = useLanguage();

  return (
    <div className="homeguest">
      <header className="homeguest-topbar">
        <span className="homeguest-guest-badge">*{t("nav.guest")}*</span>
        <LangToggle className="homeguest-lang-toggle" />
      </header>

      <h1 className="suggestions-title">{t("home.suggestionsTitle")}</h1>

      <div className="deck-list">
        {decks.map((deck) => (
          <section key={deck.id} className={`deck-card ${deck.colorClass}`}>
            <img className="deck-cover" src={deck.cover} alt="" />
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

      <BottomNav active="home" />
    </div>
  );
}

export default HomeGuest;
