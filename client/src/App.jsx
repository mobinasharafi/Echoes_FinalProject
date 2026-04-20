// Sets up the main app routes and shows different navigation for each role

import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import SubmitCase from "./pages/SubmitCase.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyCases from "./pages/MyCases.jsx";
import Moderation from "./pages/Moderation.jsx";
import PersonalInfo from "./pages/PersonalInfo.jsx";
import Wellness from "./pages/Wellness.jsx";

function AppContent() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isRepresentative = user && user.role === "representative";
  const isModerator = user && user.role === "moderator";

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="nav-bar">
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>

        {!isModerator && <Link to="/wellness">Wellness</Link>}

        {isModerator && <Link to="/moderation">See Updates</Link>}

        {isRepresentative && <Link to="/submit">Submit Case</Link>}

        {isRepresentative && <Link to="/my-cases">View My Active Cases</Link>}

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

        {user && <Link to="/personal-info">My Personal Information</Link>}

        {user && (
          <button type="button" onClick={handleLogout} className="nav-logout">
            Logout
          </button>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/submit" element={<SubmitCase />} />
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}