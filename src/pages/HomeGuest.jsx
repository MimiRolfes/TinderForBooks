import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import BottomNav from "../components/BottomNav";
import GuestTopbar from "../components/GuestTopbar";
import { usePageTheme } from "../hooks/usePageTheme";
import coverDarkRomance from "../assets/covers/dark-romance.jpg";
import coverRomance from "../assets/covers/romance.jpg";
import coverFourthWing from "../assets/covers/fourth-wing.jpg";
import coverBlackwood from "../assets/covers/blackwood-institute.jpg";
import coverMimik from "../assets/covers/mimik.jpg";
import "../styles/HomeGuest.css";

const decks = [
  { id: "dark-romance", title: "Dark Romance (De)", genre: "Dark Romance", query: "Dark Romance", colorClass: "deck-dark-romance", cover: coverDarkRomance },
  { id: "romance", title: "Romance (De)", genre: "Romance", query: "Romance", colorClass: "deck-romance", cover: coverRomance },
  { id: "fantasy", title: "Fantasy (De)", genre: "Fantasy", query: "Fantasy", colorClass: "deck-fantasy", cover: coverFourthWing },
  { id: "horror", title: "Horror (De)", genre: "Horror", query: "Horror", colorClass: "deck-horror", cover: coverBlackwood },
  { id: "romantasy", title: "Romantasy (De)", genre: "Romance/Fantasy", query: "Romantasy", colorClass: "deck-romantasy", cover: coverFourthWing },
  { id: "dark", title: "Dark (De)", genre: "Dark Romance, Horror, Reverse Harem, Dark Thriller", query: "Dark Romance", colorClass: "deck-dark", cover: coverBlackwood },
  { id: "thriller-krimi", title: "Thriller/Krimi (De)", genre: "Thriller, Krimi", query: "Thriller", colorClass: "deck-thriller-krimi", cover: coverMimik },
];

function HomeGuest() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  usePageTheme("#2B2F33");

  const swipeDeck = (deck) =>
    navigate("/guest-swipe", { state: { genre: deck.query } });

  return (
    <div className="homeguest">
      <GuestTopbar />

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
                <button
                  type="button"
                  className="deck-swipe-btn"
                  onClick={() => swipeDeck(deck)}
                >
                  {t("home.swipeButton")}
                </button>
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
