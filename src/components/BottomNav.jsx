import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import homeIcon from "../assets/nav/home.png";
import preferencesIcon from "../assets/nav/preferences.png";
import swipeIcon from "../assets/nav/swipe.png";
import wishlistIcon from "../assets/nav/wishlist.png";
import "../styles/BottomNav.css";

// Primary mobile navigation for the guest flow. `glow` is the colour the
// active icon lights up with in Figma — it matches each icon's own colour.
const ITEMS = [
  { key: "home", labelKey: "nav.home", icon: homeIcon, to: "/home-guest", glow: "#90CAF9" },
  { key: "preferences", labelKey: "nav.preferences", icon: preferencesIcon, to: "/guest-preferences", glow: "#90CAF9" },
  { key: "swipe", labelKey: "nav.swipe", icon: swipeIcon, to: "/guest-swipe", glow: "#FB7072" },
  { key: "wishlist", labelKey: "nav.wishlist", icon: wishlistIcon, to: "/guest-wishlist", glow: "#A5D6A7" },
];

function BottomNav({ active = "home" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            style={{ "--nav-glow": item.glow }}
            aria-current={isActive ? "page" : undefined}
            onClick={() => navigate(item.to)}
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
