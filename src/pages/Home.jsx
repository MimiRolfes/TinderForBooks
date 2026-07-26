import { useLanguage } from "../contexts/LanguageContext";

function Home() {
  const { t } = useLanguage();

  return (
    <div className="home">
      <h1>{t("nav.home")}</h1>
    </div>
  );
}

export default Home;
