// Browse page for viewing published cases as both map markers and case cards

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiGet, getFileUrl } from "../api.js";

function MapAutoFit({ casesWithCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (casesWithCoordinates.length === 0) {
      map.setView([54.5, -3], 5);
      return;
    }

    if (casesWithCoordinates.length === 1) {
      const onlyCase = casesWithCoordinates[0];
      map.setView([onlyCase.latitude, onlyCase.longitude], 11);
      return;
    }

    const bounds = new LatLngBounds(
      casesWithCoordinates.map((caseItem) => [
        caseItem.latitude,
        caseItem.longitude,
      ])
    );

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [casesWithCoordinates, map]);

  return null;
}

export default function Browse() {
  const [cases, setCases] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCases = async (selectedCity = "") => {
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams();

      if (selectedCity.trim()) {
        queryParams.append("city", selectedCity.trim());
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
    fetchCases(city);
  };

  const handleClearFilters = () => {
    setCity("");
    fetchCases("");
  };

  const casesWithCoordinates = useMemo(() => {
    return cases.filter(
      (caseItem) =>
        typeof caseItem.latitude === "number" &&
        typeof caseItem.longitude === "number" &&
        !Number.isNaN(caseItem.latitude) &&
        !Number.isNaN(caseItem.longitude)
    );
  }, [cases]);

  return (
    <div className="page-shell browse-page">
      <h1 className="page-title">Browse Cases</h1>
      <p className="page-intro">
        Explore published cases across the UK, search by city, or look around the
        map directly.
      </p>

      <form onSubmit={handleFilterSubmit} className="inline-form">
        <div>
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="e.g. London"
            className="text-input"
          />
        </div>

        <div className="inline-actions">
          <button type="submit" className="primary-button">
            Search City
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="secondary-button"
          >
            Show All
          </button>
        </div>
      </form>

      {!loading && !error && (
        <div className="browse-map-section">
          <div className="browse-map-card">
            <div className="browse-map-header">
              <h2 className="browse-map-title">Case Map</h2>
              <p className="browse-map-text">
                Red dots show the last known locations of published cases.
              </p>
            </div>

            <div className="browse-map-wrap">
              <MapContainer
                center={[54.5, -3]}
                zoom={5}
                scrollWheelZoom={true}
                className="browse-map"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapAutoFit casesWithCoordinates={casesWithCoordinates} />

                {casesWithCoordinates.map((caseItem) => (
                  <CircleMarker
                    key={caseItem._id}
                    center={[caseItem.latitude, caseItem.longitude]}
                    radius={8}
                    pathOptions={{
                      color: "#b24a4a",
                      fillColor: "#c95d5d",
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="map-popup-content">
                        <strong>{caseItem.personName}</strong>
                        <p>
                          <strong>Last seen:</strong> {caseItem.lastSeenLocation}
                        </p>
                        <p>
                          <strong>City:</strong> {caseItem.city}
                        </p>
                        <Link to={`/cases/${caseItem._id}`}>View details</Link>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {casesWithCoordinates.length === 0 && (
              <p className="helper-text browse-map-empty">
                No map locations are available for the current results yet.
              </p>
            )}
          </div>
        </div>
      )}

      {loading && <p>Loading cases...</p>}
      {error && <p className="status-error">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p>No published cases matched your search.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="browse-case-grid">
          {cases.map((caseItem) => {
            const imageUrl = caseItem.photoUrl ? getFileUrl(caseItem.photoUrl) : "";

            return (
              <div key={caseItem._id} className="page-card browse-case-card">
                {imageUrl ? (
                  <div className="case-image-wrap browse-case-image-wrap">
                    <img
                      src={imageUrl}
                      alt={caseItem.personName}
                      className="case-image-small"
                    />
                  </div>
                ) : null}

                <h2 className="browse-case-title">{caseItem.personName}</h2>

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

                {caseItem.region ? (
                  <p>
                    <strong>Region:</strong> {caseItem.region}
                  </p>
                ) : null}

                <p>
                  <strong>Date last seen:</strong>{" "}
                  {new Date(caseItem.lastSeenDate).toLocaleDateString()}
                </p>

                <p className="browse-case-description">{caseItem.description}</p>

                <Link to={`/cases/${caseItem._id}`}>View details</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}