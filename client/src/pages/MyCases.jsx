// Shows active cases for representatives or all active cases for moderators

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, getFileUrl } from "../api.js";

export default function MyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isModerator = user && user.role === "moderator";

  useEffect(() => {
    const fetchMyCases = async () => {
      try {
        setLoading(true);
        setError("");

        const caseData = await apiGet("/api/cases/mine/active", true);
        const fetchedCases = caseData.cases || [];

        const casesWithMessageInfo = await Promise.all(
          fetchedCases.map(async (caseItem) => {
            try {
              const contributionData = await apiGet(
                `/api/contributions/case/${caseItem._id}`
              );

              const contributions = contributionData.contributions || [];

              const storageKey = `lastViewedCase_${caseItem._id}`;
              const lastViewedAt = localStorage.getItem(storageKey);

              const newMessagesCount = lastViewedAt
                ? contributions.filter(
                    (contribution) =>
                      new Date(contribution.createdAt) > new Date(lastViewedAt)
                  ).length
                : contributions.length;

              return {
                ...caseItem,
                newMessagesCount,
              };
            } catch {
              return {
                ...caseItem,
                newMessagesCount: 0,
              };
            }
          })
        );

        setCases(casesWithMessageInfo);
      } catch (err) {
        setError(err.message || "Failed to load active cases");
      } finally {
        setLoading(false);
      }
    };

    if (!isModerator) {
      fetchMyCases();
    } else {
      setLoading(false);
    }
  }, [isModerator]);

  if (!user || user.role !== "representative") {
    return (
      <div className="page-shell">
        <h1 className="page-title">My Active Cases</h1>
        <p className="status-error">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title">My Active Cases</h1>
      <p className="page-intro">
        Open a case below to review new messages and manage it.
      </p>

      {loading && <p>Loading active cases...</p>}

      {error && <p className="status-error">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p>You do not have any active published cases right now.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="stack-list">
          {cases.map((caseItem) => {
            const imageUrl = caseItem.photoUrl ? getFileUrl(caseItem.photoUrl) : "";

            return (
              <div key={caseItem._id} className="page-card">
                {imageUrl ? (
                  <div className="case-image-wrap browse-case-image-wrap">
                    <img
                      src={imageUrl}
                      alt={caseItem.personName}
                      className="case-image-small"
                    />
                  </div>
                ) : null}

                <h2>{caseItem.personName}</h2>

                {caseItem.age !== undefined && caseItem.age !== null && (
                  <p>
                    <strong>Age:</strong> {caseItem.age}
                  </p>
                )}

                <p>
                  <strong>City:</strong> {caseItem.city}
                </p>

                <p>
                  <strong>Last seen location:</strong> {caseItem.lastSeenLocation}
                </p>

                <p>
                  <strong>Date last seen:</strong>{" "}
                  {new Date(caseItem.lastSeenDate).toLocaleDateString()}
                </p>

                <p>
                  <strong>Status:</strong> {caseItem.status}
                </p>

                <p>{caseItem.description}</p>

                <Link to={`/cases/${caseItem._id}`}>
                  Manage this case
                </Link>

                {caseItem.newMessagesCount === 0 ? (
                  <p className="helper-text my-case-message-status">
                    You have no new messages.
                  </p>
                ) : (
                  <p className="my-case-message-status my-case-message-status-new">
                    {caseItem.newMessagesCount === 1
                      ? "You have a new message."
                      : `You have ${caseItem.newMessagesCount} new messages.`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}