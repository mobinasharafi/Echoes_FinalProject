import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import SubmitCase from "./pages/SubmitCase.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyCases from "./pages/MyCases.jsx";

function AppContent() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const canManageCases =
    user && (user.role === "representative" || user.role === "moderator");

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

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
        <Link to="/submit">Submit Case</Link>

        {canManageCases && <Link to="/my-cases">View My Active Cases</Link>}

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

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