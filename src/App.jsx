import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Preferences from "./pages/Preferences";
import Swipe from "./pages/Swipe";
import Wishlist from "./pages/Wishlist";
import Read from "./pages/Read";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/swipe" element={<Swipe />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/read" element={<Read />} />
      </Routes>
    </Router>
  );
}

export default App;
