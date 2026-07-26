import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import HomeGuest from "./pages/HomeGuest";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home-guest" element={<HomeGuest />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
