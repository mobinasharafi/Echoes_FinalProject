import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import SubmitCase from "./pages/SubmitCase.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/submit">Submit Case</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/submit" element={<SubmitCase />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </div>
  );
}