import { Link, useLocation } from "react-router-dom";
import "../styles/Navigation.css";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Tinder for Books
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/preferences" 
              className={`navbar-link ${location.pathname === "/preferences" ? "active" : ""}`}
            >
              Preferences
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/swipe" 
              className={`navbar-link ${location.pathname === "/swipe" ? "active" : ""}`}
            >
              Swipe
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/wishlist" 
              className={`navbar-link ${location.pathname === "/wishlist" ? "active" : ""}`}
            >
              Wishlist
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/read" 
              className={`navbar-link ${location.pathname === "/read" ? "active" : ""}`}
            >
              Already Read
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;