import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import HomeGuest from "./pages/HomeGuest";
import GuestPreferences from "./pages/GuestPreferences";
import GuestSwipe from "./pages/GuestSwipe";
import GuestWishlist from "./pages/GuestWishlist";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home-guest" element={<HomeGuest />} />
          <Route path="/guest-preferences" element={<GuestPreferences />} />
          <Route path="/guest-swipe" element={<GuestSwipe />} />
          <Route path="/guest-wishlist" element={<GuestWishlist />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
