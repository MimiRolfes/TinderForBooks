import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LangToggle from "../components/LangToggle";
import { usePageTheme } from "../hooks/usePageTheme";
import cosmosBg from "../assets/cosmos_2099375163.jpeg";
import "../styles/Landing.css";

function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // iOS Safari fills the status-bar strip with this colour. It matches the
  // gradient at the top of .landing-backdrop, so strip and page look like one
  // surface. Keep both in sync.
  usePageTheme("#151719");

  return (
    <div className="landing">
      {/* Figma frame background: black fill + cosmos water at 21% on top.
          Pinned to the screen — never moves, covers the whole viewport. */}
      <div
        className="landing-backdrop"
        style={{ "--bg-image": `url(${cosmosBg})` }}
        aria-hidden="true"
      />

      <div className="landing-inner">
        <LangToggle className="landing-lang-toggle" />

        <h1 className="landing-title">
          {t("landing.titlePre")} <span className="highlight">{t("landing.titleHighlight")}</span> {t("landing.titlePost")}
        </h1>

        <div className="landing-actions">
          <button className="landing-btn" onClick={() => navigate("/home-guest")}>
            {t("landing.guestButton")}
          </button>
          <button className="landing-btn" onClick={() => navigate("/profile")}>
            {t("landing.loginButton")}
          </button>
        </div>

        <section className="landing-card">
          <h2>{t("landing.howItWorksTitle")}</h2>
          <p>
            <em>{t("landing.guestLabel")}</em>
            <br /> {t("landing.guestBody")}
          </p>
          <p>
            <em>{t("landing.loginLabel")}</em>
            <br /> {t("landing.loginBody")}
          </p>
        </section>

        <section className="landing-card">
          <h2>{t("landing.whatWeDoTitle")}</h2>
          <p>
            {t("landing.whatWeDoPre")} <em>{t("landing.whatWeDoEm1")}</em> {t("landing.whatWeDoMid")}{" "}
            <em>{t("landing.whatWeDoEm2")}</em>
            {t("landing.whatWeDoEnd")} <em>{t("landing.whatWeDoEm3")}</em>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Landing;
