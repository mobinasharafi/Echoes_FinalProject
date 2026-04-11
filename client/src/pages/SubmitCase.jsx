// Case submission page for representatives and moderators

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitCase() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    personName: "",
    age: "",
    description: "",
    lastSeenDate: "",
    lastSeenLocation: "",
    city: "",
    region: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const allowedToSubmit =
    user &&
    (user.role === "representative" || user.role === "moderator");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const selectedFile = event.target.files[0] || null;
    setPhotoFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();

      submitData.append("personName", formData.personName);
      submitData.append("age", formData.age);
      submitData.append("description", formData.description);
      submitData.append("lastSeenDate", formData.lastSeenDate);
      submitData.append("lastSeenLocation", formData.lastSeenLocation);
      submitData.append("city", formData.city);
      submitData.append("region", formData.region);

      if (photoFile) {
        submitData.append("photo", photoFile);
      }

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create case"
        );
      }

      setSuccess(data.message || "Case created successfully");

      setFormData({
        personName: "",
        age: "",
        description: "",
        lastSeenDate: "",
        lastSeenLocation: "",
        city: "",
        region: "",
      });

      setPhotoFile(null);

      setTimeout(() => {
        navigate("/browse");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-shell-narrow">
        <h1 className="page-title">Submit a Case</h1>
        <p className="page-intro">You need to be logged in to submit a case.</p>
      </div>
    );
  }

  if (!allowedToSubmit) {
    return (
      <div className="page-shell-narrow">
        <h1 className="page-title">Submit a Case</h1>
        <p className="page-intro">
          This section is only available to people who have registered as an
          authorised representative. If you want to report someone who has gone
          missing, please log out and register again as an authorised
          representative.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">Submit a Case</h1>
      <p className="page-intro">
        Add the main information carefully. This creates the case record that
        people will later browse and respond to.
      </p>

      <form onSubmit={handleSubmit} className="page-card">
        <div className="form-row">
          <label htmlFor="personName" className="form-label">
            Missing Person's Name
          </label>
          <input
            id="personName"
            name="personName"
            type="text"
            value={formData.personName}
            onChange={handleChange}
            required
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="age" className="form-label">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            min="0"
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className="text-area"
          />
        </div>

        <div className="form-row">
          <label htmlFor="lastSeenDate" className="form-label">
            Last Seen Date
          </label>
          <input
            id="lastSeenDate"
            name="lastSeenDate"
            type="date"
            value={formData.lastSeenDate}
            onChange={handleChange}
            required
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="lastSeenLocation" className="form-label">
            Last Seen Location
          </label>
          <input
            id="lastSeenLocation"
            name="lastSeenLocation"
            type="text"
            value={formData.lastSeenLocation}
            onChange={handleChange}
            required
            placeholder="e.g. London Marylebone or Brixton, near Brockwell Park"
            className="text-input"
          />
          <p className="helper-text">
            Use a clear UK place name so the case can appear properly on the map.
          </p>
        </div>

        <div className="form-row">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            required
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="region" className="form-label">
            Region
          </label>
          <input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={handleChange}
            className="text-input"
          />
        </div>

        <div className="form-row">
          <label htmlFor="photo" className="form-label">
            Photo
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handlePhotoChange}
            className="file-input"
          />
          <p className="helper-text">
            Upload a JPG, PNG, or WEBP image from your computer.
          </p>
        </div>

        {error && <p className="status-error">{error}</p>}
        {success && <p className="status-success">{success}</p>}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Creating case..." : "Submit Case"}
        </button>
      </form>
    </div>
  );
}