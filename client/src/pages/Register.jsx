import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "public",
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save the session so protected actions can use it later
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Registration successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h1>Register</h1>
      <p>Create an Echoes account.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
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

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
            }}
          >
            <option value="representative">Authorised Representative</option>
            <option value="public">Public Contributor</option>
          </select>
        </div>

        <p style={{ fontSize: "14px", color: "#555", marginBottom: "16px" }}>
          Moderator accounts are not available through public registration. If you
          are looking to become a moderator, please contact us at echoesmpc@gmail.com.
        </p>

        {error && (
          <p style={{ color: "crimson", marginBottom: "12px" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>
        )}

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}