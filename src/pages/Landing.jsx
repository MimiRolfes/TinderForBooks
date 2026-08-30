import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LangToggle from "../components/LangToggle";
import cosmosBg from "../assets/cosmos_2099375163.jpeg";
import turtleDoodle from "../assets/turtle-doodle.png";
import "../styles/Landing.css";

function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="landing" style={{ "--bg-image": `url(${cosmosBg})` }}>
      <div className="landing-inner">
        <LangToggle className="landing-lang-toggle" />

        <h1 className="landing-title">
          {t("landing.titlePre")} <span className="highlight">{t("landing.titleHighlight")}</span> {t("landing.titlePost")}
        </h1>

        <div className="landing-actions">
          <img className="landing-doodle" src={turtleDoodle} alt="" aria-hidden="true" />
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
