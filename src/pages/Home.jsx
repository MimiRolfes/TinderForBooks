import "./../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <p className="landing-eyebrow">{t("home.eyebrow")}</p>
        <h1 className="landing-title">{t("home.title")}</h1>
        <p className="landing-subtitle">{t("home.subtitle")}</p>
        <button className="landing-button" onClick={() => navigate("/preferences")}>
          {t("home.cta")}
        </button>
        <p className="landing-footnote">{t("home.footnote")}</p>
      </div>

      <div className="landing-divider" />

      <div className="info-cards">
        <div className="info-card">
          <span className="info-card-icon">📖</span>
          <h2>{t("home.card1Title")}</h2>
          <p>{t("home.card1Body")}</p>
        </div>

        <div className="info-card">
          <span className="info-card-icon">🫶</span>
          <h2>{t("home.card2Title")}</h2>
          <p>{t("home.card2Body")}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
