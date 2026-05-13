import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Navigation.css";

const NAV_ITEMS = [
  { to: "/",         key: "home",     icon: "🏠" },
  { to: "/swipe",    key: "swipe",    icon: "📖" },
  { to: "/wishlist", key: "wishlist", icon: "❤️" },
  { to: "/read",     key: "read",     icon: "✅" },
];

function Navigation() {
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      {/* Language toggle — fixed top-right on mobile, hidden on desktop (rendered in navbar-account there) */}
      <div className="lang-toggle-wrap">
        <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">
          <span className={lang === "en" ? "lang-active" : ""}>EN</span>
          <span className="lang-sep">|</span>
          <span className={lang === "de" ? "lang-active" : ""}>DE</span>
        </button>
      </div>

      <nav className="navbar">
        {/* Desktop: logo left */}
        <Link to="/" className="navbar-logo">
          {t("nav.appName")}
        </Link>

        <div className="navbar-container">
          <ul className="navbar-menu">
            {NAV_ITEMS.map(({ to, key, icon }) => (
              <li key={to} className="navbar-item">
                <Link
                  to={to}
                  className={`navbar-link${isActive(to) ? " active" : ""}`}
                >
                  <span className="nav-icon">{icon}</span>
                  <span>{t(`nav.${key}`)}</span>
                </Link>
              </li>
            ))}

            {/* Profile tab — mobile only (hidden on desktop via CSS) */}
            <li className="navbar-item navbar-item--profile">
              <Link
                to="/profile"
                className={`navbar-link${isActive("/profile") ? " active" : ""}`}
              >
                <span className="nav-icon">👤</span>
                <span>{t("nav.profile")}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop: language toggle + account button right */}
        <div className="navbar-account">
          <button className="lang-toggle lang-toggle--desktop" onClick={toggleLang} aria-label="Toggle language">
            <span className={lang === "en" ? "lang-active" : ""}>EN</span>
            <span className="lang-sep">|</span>
            <span className={lang === "de" ? "lang-active" : ""}>DE</span>
          </button>
          <Link to="/profile" className="navbar-account-btn">
            <span className="navbar-account-avatar">{t("nav.guest")[0]}</span>
            {t("nav.guest")}
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
