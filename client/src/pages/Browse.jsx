import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";

export default function Browse() {
  const [cases, setCases] = useState([]);
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCases = async (selectedCity = "", selectedRegion = "") => {
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams();

      if (selectedCity.trim()) {
        queryParams.append("city", selectedCity.trim());
      }

      if (selectedRegion.trim()) {
        queryParams.append("region", selectedRegion.trim());
      }

      const queryString = queryParams.toString();
      const path = queryString ? `/api/cases?${queryString}` : "/api/cases";

      const data = await apiGet(path);
      setCases(data.cases || []);
    } catch (err) {
      setError(err.message || "Failed to load cases");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchCases(city, region);
  };

  const handleClearFilters = () => {
    setCity("");
    setRegion("");
    fetchCases("", "");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1>Browse Cases</h1>
      <p>Explore published cases by city or region.</p>

      <form
        onSubmit={handleFilterSubmit}
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            style={{
              display: "block",
              padding: "10px",
              marginTop: "6px",
              minWidth: "220px",
            }}
          />
        </div>

        <div>
          <label htmlFor="region">Region</label>
          <input
            id="region"
            type="text"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            style={{
              display: "block",
              padding: "10px",
              marginTop: "6px",
              minWidth: "220px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <button type="submit" style={{ padding: "10px 16px" }}>
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{ padding: "10px 16px" }}
          >
            Clear
          </button>
        </div>
      </form>

      {loading && <p>Loading cases...</p>}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p>No published cases matched your filters.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div style={{ display: "grid", gap: "16px" }}>
          {cases.map((caseItem) => (
            <div
              key={caseItem._id}
              style={{
                border: "1px solid #ddd",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{caseItem.personName}</h2>

              {caseItem.age !== undefined && caseItem.age !== null && (
                <p>
                  <strong>Age:</strong> {caseItem.age}
                </p>
              )}

              <p>
                <strong>Last seen:</strong> {caseItem.lastSeenLocation}
              </p>

              <p>
                <strong>City:</strong> {caseItem.city}
              </p>

              <p>
                <strong>Region:</strong> {caseItem.region}
              </p>

              <p>
                <strong>Date last seen:</strong>{" "}
                {new Date(caseItem.lastSeenDate).toLocaleDateString()}
              </p>

              <p>{caseItem.description}</p>

              <Link to={`/cases/${caseItem._id}`}>View case</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}