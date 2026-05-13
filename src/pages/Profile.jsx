import "../styles/ProfilePage.css";
import { useLanguage } from "../contexts/LanguageContext";

function Profile() {
  const { t } = useLanguage();

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="profile-avatar">{t("profile.avatarLabel")}</div>
        <p className="profile-guest-name">{t("profile.guestLabel")}</p>
        <p className="profile-mode-label">{t("profile.modeLabel")}</p>
        <p className="profile-mode-hint">{t("profile.modeHint")}</p>
      </div>

      <div className="profile-actions">
        <button className="profile-btn profile-btn--primary" disabled>
          {t("profile.login")}
        </button>
        <button className="profile-btn profile-btn--secondary" disabled>
          {t("profile.register")}
        </button>
      </div>

      <div className="profile-coming-soon">
        <p>{t("profile.comingSoon")}</p>
        <p>{t("profile.comingSoonDetail")}</p>
      </div>
    </div>
  );
}

export default Profile;
