import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

export default function Home() {
  const [apiStatus, setApiStatus] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/api/health")
      .then((data) => {
        setApiStatus(data.message || "Backend reachable");
      })
      .catch((err) => {
        setApiStatus("Backend not reachable");
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h1>Echoes</h1>
      <p>
        A public participation platform for unsolved missing persons cases in the
        UK.
      </p>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
        <b>Backend check:</b> {apiStatus}
        {error ? (
          <div style={{ marginTop: 8 }}>
            <small>Error: {error}</small>
          </div>
        ) : null}
      </div>

      <p style={{ marginTop: 16 }}>
        Use <b>Browse</b> to explore cases by location, or <b>Submit Case</b> if
        you are an authorised representative.
      </p>
    </div>
  );
}