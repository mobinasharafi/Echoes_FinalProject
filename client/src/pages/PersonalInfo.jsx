// Lets a logged-in user view and update their own account details

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api.js";

function isStrongPassword(password) {
  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordPattern.test(password);
}

export default function PersonalInfo() {
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    role: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet("/api/auth/me", true);
        const foundUser = data.user;

        setProfileForm({
          fullName: foundUser.fullName || "",
          email: foundUser.email || "",
          role: foundUser.role || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load personal information");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPersonalInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    setError("");
    setProfileSuccess("");
    setPasswordSuccess("");

    try {
      const data = await apiPatch(
        "/api/auth/me/profile",
        {
          fullName: profileForm.fullName,
          email: profileForm.email,
        },
        true
      );

      if (data.user) {
        const updatedUser = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfileForm((prev) => ({
          ...prev,
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          role: data.user.role || prev.role,
        }));
      }

      setProfileSuccess(
        data.message || "Personal information updated successfully"
      );
    } catch (err) {
      setError(err.message || "Failed to update personal information");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordLoading(true);
    setError("");
    setPasswordSuccess("");
    setProfileSuccess("");

    try {
      if (!isStrongPassword(passwordForm.newPassword)) {
        throw new Error(
          "For safety, passwords must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number. Echoes deals with sensitive information, so protecting your account helps us protect you too."
        );
      }

      const data = await apiPatch("/api/auth/me/password", passwordForm, true);

      setPasswordSuccess(data.message || "Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-shell-narrow">
        <h1 className="page-title">My Personal Information</h1>
        <p className="page-intro">You need to be logged in to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading personal information...</p>;
  }

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">My Personal Information</h1>
      <p className="page-intro">
        Review your details and update your account safely.
      </p>

      {error && <p className="status-error">{error}</p>}
      {passwordSuccess && <p className="status-success">{passwordSuccess}</p>}

      <div className="page-card">
        <h2>Account Details</h2>

        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={profileForm.fullName}
              onChange={handleProfileChange}
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
              value={profileForm.email}
              onChange={handleProfileChange}
              required
              className="text-input"
            />
          </div>

          <div className="form-row">
            <label htmlFor="role" className="form-label">
              Account Type
            </label>
            <input
              id="role"
              type="text"
              value={profileForm.role}
              disabled
              className="text-input"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="primary-button"
          >
            {profileLoading ? "Saving..." : "Save personal information"}
          </button>

          {profileSuccess ? (
            <p className="status-success" style={{ marginTop: "12px" }}>
              {profileSuccess}
            </p>
          ) : null}
        </form>
      </div>

      <div className="page-card">
        <h2>Change Password</h2>

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-row">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
              className="text-input"
            />
          </div>

          <div className="form-row">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              className="text-input"
            />
          </div>

          <div className="form-row">
            <label htmlFor="confirmNewPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordChange}
              required
              className="text-input"
            />
          </div>

          <p className="helper-text">
            Your new password must have at least 8 characters, including one
            uppercase letter, one lowercase letter, and one number.
          </p>

          <button
            type="submit"
            disabled={passwordLoading}
            className="primary-button"
          >
            {passwordLoading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}