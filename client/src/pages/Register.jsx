import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api.js";

function isStrongPassword(password) {
  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordPattern.test(password);
}

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
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const passwordIsWeak =
    attemptedSubmit &&
    formData.password.length > 0 &&
    !isStrongPassword(formData.password);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiPost("/api/auth/register", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Registration successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      const message = err.message || "Something went wrong";

      if (message.toLowerCase().includes("password")) {
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">Register</h1>
      <p className="page-intro">Create an Echoes account.</p>

      <form onSubmit={handleSubmit} className="page-card">
        <div className="form-row">
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="text-input"
          />
          <p
            className="helper-text"
            style={{ color: passwordIsWeak ? "#b91c1c" : undefined }}
          >
            Please choose a password with at least 8 characters, including one
            uppercase letter, one lowercase letter, and one number. Echoes deals
            with sensitive information, so protecting your account helps us protect
            you too.
          </p>
        </div>

        <div className="form-row">
          <label htmlFor="role" className="form-label">
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select-input"
          >
            <option value="representative">Authorised Representative</option>
            <option value="public">Public Contributor</option>
          </select>
        </div>

        <p className="helper-text">
          Moderator accounts are not available through public registration. If you
          are looking to become a moderator, please contact us at echoesmpc@gmail.com.
        </p>

        {error && <p className="status-error">{error}</p>}
        {success && <p className="status-success">{success}</p>}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}