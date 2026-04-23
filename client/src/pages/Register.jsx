// Register page for creating a new Echoes account and confirming the platform terms before sign-up.

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

  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Terms modal + acknowledgement state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasOpenedTerms, setHasOpenedTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordIsWeak =
    attemptedSubmit &&
    formData.password.length > 0 &&
    !isStrongPassword(formData.password);

  const termsNotAccepted = attemptedSubmit && !acceptedTerms;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    setHasOpenedTerms(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsModal(false);
  };

  const handleTermsCheckboxChange = () => {
    if (!hasOpenedTerms) {
      return;
    }

    setAcceptedTerms((prev) => !prev);
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setError("");
    setSuccess("");

    if (!isStrongPassword(formData.password)) {
      return;
    }

    if (!acceptedTerms) {
      return;
    }

    setLoading(true);

    try {
      await apiPost("/api/auth/register/request-code", formData);
      setCodeSent(true);
      setSuccess("A 6-digit verification code has been sent to your email.");
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

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const data = await apiPost("/api/auth/register/verify-code", {
        email: formData.email,
        code: verificationCode,
      });

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
    <div className="page-shell-narrow">
      <h1 className="page-title">Register</h1>
      <p className="page-intro">Create an Echoes account.</p>

      <form
        onSubmit={codeSent ? handleVerifyCode : handleRequestCode}
        className="page-card"
      >
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
            disabled={codeSent}
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
            disabled={codeSent}
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
            disabled={codeSent}
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
            disabled={codeSent}
          >
            <option value="representative">Authorised Representative</option>
            <option value="public">Public Contributor</option>
          </select>
        </div>

        <p className="helper-text">
          Moderator accounts are not available through public registration. If you
          are looking to become a moderator, please contact us at echoesmpc@gmail.com.
        </p>

        <div className="form-row">
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              cursor: hasOpenedTerms ? "pointer" : "not-allowed",
              opacity: hasOpenedTerms ? 1 : 0.7,
            }}
          >
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsCheckboxChange}
              disabled={!hasOpenedTerms || codeSent}
              style={{ marginTop: "0.2rem" }}
            />
            <span className="helper-text" style={{ margin: 0 }}>
              I have read and understood the{" "}
              <button
                type="button"
                onClick={openTermsModal}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  color: "var(--link-blue)",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                disabled={codeSent}
              >
                terms and conditions
              </button>
              .
            </span>
          </label>

          {!hasOpenedTerms && (
            <p className="helper-text" style={{ marginTop: "0.5rem" }}>
              Please open and read the terms before confirming.
            </p>
          )}

          {termsNotAccepted && (
            <p
              className="helper-text"
              style={{ marginTop: "0.5rem", color: "var(--error)" }}
            >
              You must read and accept the terms before registering.
            </p>
          )}
        </div>

        {codeSent && (
          <div className="form-row">
            <label htmlFor="verificationCode" className="form-label">
              Verification Code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              required
              className="text-input"
              placeholder="Enter the 6-digit code"
            />
            <p className="helper-text">
              Please enter the 6-digit code sent to your email address.
            </p>
          </div>
        )}

        {error && <p className="status-error">{error}</p>}
        {success && <p className="status-success">{success}</p>}

        <button type="submit" disabled={loading} className="primary-button">
          {loading
            ? codeSent
              ? "Verifying..."
              : "Sending code..."
            : codeSent
            ? "Verify and create account"
            : "Register"}
        </button>
      </form>

      {showTermsModal && (
        <div
          onClick={closeTermsModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(47, 58, 54, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div
            className="page-card"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "85vh",
              overflowY: "auto",
              marginBottom: 0,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Echoes Terms and Conditions</h2>

            <p>
              Echoes is{" "}
              <strong>
                not a replacement for police, emergency services, or formal
                investigation.
              </strong>{" "}
              Important information should be passed to the authorities. This
              platform may support visibility and communication, but it must
              never be treated as the primary or sufficient response to a
              disappearance.
            </p>

            <p>
              You must not post a person as missing if they are not missing.{" "}
              <strong>
                You must not use this platform to harass, manipulate, shame,
                threaten, stalk, fabricate, speculate irresponsibly, or spread
                misinformation.
              </strong>{" "}
              Any such use is a serious abuse of the platform and may result in
              removal, reporting, or permanent restriction.
            </p>

            <p>
              Only people who are close to the missing person, or otherwise
              authorised to speak on their behalf, should submit cases. The
              subject matter of this platform is sensitive by nature. That means{" "}
              <strong>
                users are expected to act with seriousness, honesty, and
                restraint.
              </strong>
            </p>

            <p>
              By proceeding, you acknowledge the need to{" "}
              <strong>prioritise and trust the authorities</strong> to deal with
              each case's information and that public concern does not justify
              reckless behaviour.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={closeTermsModal}
                className="secondary-button"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleAcceptTerms}
                className="primary-button"
              >
                I have read and understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}