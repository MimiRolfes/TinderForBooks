import { useLanguage } from "../contexts/LanguageContext";
import "../styles/LangToggle.css";

// Shared EN/DE switch. Visual style lives here so it stays identical on
// every screen; pages pass a className only for positioning.
function LangToggle({ className = "" }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      className={`lang-toggle ${className}`.trim()}
      onClick={toggleLang}
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "active" : ""}>en</span>
      <span className="sep">|</span>
      <span className={lang === "de" ? "active" : ""}>de</span>
    </button>
  );
}

export default LangToggle;
