// Login page for Echoes users

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api.js";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiPost("/api/auth/login", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h1>Login</h1>
      <p>Sign in to your Echoes account.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "crimson", marginBottom: "12px" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>
        )}

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}