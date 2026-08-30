import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LangToggle from "./LangToggle";
import "../styles/GuestTopbar.css";

// Shared top bar for guest screens. The "*Guest*" badge looks like plain
// text but is the tap target back to the Start screen (to log in /
// register); EN/DE toggle on the right. Kept in one place so size and
// position are identical everywhere.
function GuestTopbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="guest-topbar">
      <button
        type="button"
        className="guest-topbar-badge"
        onClick={() => navigate("/")}
        aria-label={t("guestTopbar.back")}
      >
        *{t("nav.guest")}*
      </button>
      <LangToggle className="guest-topbar-lang" />
    </header>
  );
}

export default GuestTopbar;
