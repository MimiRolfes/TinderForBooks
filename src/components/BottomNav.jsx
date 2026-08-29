import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import homeIcon from "../assets/nav/home.png";
import preferencesIcon from "../assets/nav/preferences.png";
import swipeIcon from "../assets/nav/swipe.png";
import wishlistIcon from "../assets/nav/wishlist.png";
import "../styles/BottomNav.css";

// Primary mobile navigation. Only "home" is wired for now — Preferences,
// Swipe and Wishlist screens don't exist yet, so those items render but
// stay inactive until their routes are added.
const ITEMS = [
  { key: "home", labelKey: "nav.home", icon: homeIcon, to: "/home-guest" },
  { key: "preferences", labelKey: "nav.preferences", icon: preferencesIcon, to: null },
  { key: "swipe", labelKey: "nav.swipe", icon: swipeIcon, to: null },
  { key: "wishlist", labelKey: "nav.wishlist", icon: wishlistIcon, to: null },
];

function BottomNav({ active = "home" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        const disabled = !item.to;
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            disabled={disabled}
            onClick={() => item.to && navigate(item.to)}
          >
            <span className="bottom-nav-icon">
              <img src={item.icon} alt="" />
            </span>
            <span className="bottom-nav-label">{t(item.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
