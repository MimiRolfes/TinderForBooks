import { useLanguage } from "../contexts/LanguageContext";
import LangToggle from "./LangToggle";
import "../styles/GuestTopbar.css";

// Shared top bar for guest screens: centered "*Guest*" badge + EN/DE
// toggle. Kept in one place so size and position are identical everywhere.
function GuestTopbar() {
  const { t } = useLanguage();

  return (
    <header className="guest-topbar">
      <span className="guest-topbar-badge">*{t("nav.guest")}*</span>
      <LangToggle className="guest-topbar-lang" />
    </header>
  );
}

export default GuestTopbar;
