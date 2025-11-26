import "./../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">Looking for a new<br/>story to read?</h1>

      <button className="landing-button" onClick={() => navigate("/preferences")}>
        Match with a book
      </button>

      <div className="section">
        <h2>What we do</h2>
        <p>
          Tinder for Books helps you discover new books that match your interests.
          Choose your preferences and swipe through personalized recommendations
          with ease.
        </p>
      </div>

      <div className="section">
        <h2>How it works</h2>
        <p>
          Swipe right if you like a book, swipe left if you don’t.
          Books you like are added to your personal wishlist.
          No accounts, no long-term storage — everything is kept only during your session.
        </p>
      </div>
    </div>
  );
}

export default Home;
