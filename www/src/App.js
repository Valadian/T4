import './App.css';
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Players from "./pages/Players";
import PlayerEditor from "./pages/players/PlayerEditor";
import TournamentEditor from "./pages/tournaments/TournamentEditor";
import {TournamentHome} from "./pages/tournaments/TournamentHome";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import NoPage from "./pages/NoPage";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<TournamentHome />} />
        <Route path="events/edit/:id" element={<TournamentEditor />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:id" element={<PlayerEditor />} />
        <Route path="players/add" element={<PlayerEditor />} />
        <Route path="search" element={<Search />} />
        <Route
          path="/profile"
          element={<ProtectedRoute path="profile" component={Profile} />}
          />
        <Route path="*" element={<NoPage />} />
      </Route>
    </Routes>
  );
}

export default App;
