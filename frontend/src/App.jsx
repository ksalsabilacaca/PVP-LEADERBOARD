import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import PlayZombieRush from "./pages/PlayZombieRush";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/play-zombie-rush" element={<PlayZombieRush />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;