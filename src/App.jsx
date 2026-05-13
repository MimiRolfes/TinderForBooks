import { supabase } from './services/supabaseClient';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home.jsx";
import Preferences from "./pages/Preferences";
import Swipe from "./pages/Swipe";
import Wishlist from "./pages/Wishlist";
import Read from "./pages/Read";
import Profile from "./pages/Profile";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/read" element={<Read />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;