// Shows moderator updates like reported comments, blocked users, and platform users

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet } from "../api.js";

export default function Moderation() {
  const [reportedContributions, setReportedContributions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      setError("");

      const [reportsData, blocksData, usersData] = await Promise.all([
        apiGet("/api/moderation/reports", true),
        apiGet("/api/moderation/blocks", true),
        apiGet("/api/moderation/users", true),
      ]);

      setReportedContributions(reportsData.contributions || []);
      setBlocks(blocksData.blocks || []);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message || "Failed to load moderation updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleDeleteContribution = async (contributionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contribution?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(`/api/moderation/contributions/${contributionId}`, true);

      setReportedContributions((prev) =>
        prev.filter((item) => item._id !== contributionId)
      );

      setSuccess("Comment deleted successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete comment");
      setSuccess("");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to fully delete this user from the platform?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(`/api/moderation/users/${userId}`, true);

      setUsers((prev) => prev.filter((item) => item._id !== userId));
      setReportedContributions((prev) =>
        prev.filter((item) => item.createdBy?._id !== userId)
      );
      setBlocks((prev) => prev.filter((item) => item.blockedUser?._id !== userId));

      setSuccess("User deleted successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete user");
      setSuccess("");
    }
  };

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((platformUser) =>
      platformUser.fullName?.toLowerCase().includes(search)
    );
  }, [users, userSearch]);

  if (!user || user.role !== "moderator") {
    return (
      <div className="page-shell">
        <h1 className="page-title">See Updates</h1>
        <p className="status-error">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell browse-page">
      <h1 className="page-title">See Updates</h1>
      <p className="page-intro">
        Review reported comments, blocked users, and platform users.
      </p>

      {loading && <p>Loading moderation updates...</p>}
      {error && <p className="status-error">{error}</p>}
      {success && <p className="status-success">{success}</p>}

      {!loading && (
        <>
          <div className="page-card">
            <h2>Reported Comments</h2>

            {reportedContributions.length === 0 ? (
              <p>No reported comments right now.</p>
            ) : (
              <div className="stack-list">
                {reportedContributions.map((contribution) => (
                  <div key={contribution._id} className="sub-card">
                    <p>
                      <strong>Case:</strong>{" "}
                      {contribution.caseId?.personName || "Unknown case"}
                    </p>
                    <p>
                      <strong>Posted by:</strong>{" "}
                      {contribution.createdBy?.fullName || "Unknown user"}
                    </p>
                    <p>
                      <strong>Message:</strong> {contribution.message}
                    </p>

                    <p>
                      <strong>Reports:</strong>
                    </p>

                    <div className="stack-list">
                      {(contribution.reports || []).map((report, index) => (
                        <div
                          key={`${contribution._id}-report-${index}`}
                          className="sub-card"
                        >
                          <p>
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p>
                            <strong>Reported by:</strong>{" "}
                            {report.reportedBy?.fullName || "Unknown user"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="owner-case-actions">
                      <button
                        type="button"
                        onClick={() => handleDeleteContribution(contribution._id)}
                        className="danger-link-button"
                      >
                        Delete comment
                      </button>

                      {contribution.caseId?._id ? (
                        <Link to={`/cases/${contribution.caseId._id}`}>
                          View case
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="page-card">
            <h2>Blocked Users</h2>

            {blocks.length === 0 ? (
              <p>No blocked users right now.</p>
            ) : (
              <div className="stack-list">
                {blocks.map((block) => (
                  <div key={block._id} className="sub-card">
                    <p>
                      <strong>Blocked user:</strong>{" "}
                      {block.blockedUser?.fullName || "Unknown user"}
                    </p>
                    <p>
                      <strong>Case:</strong>{" "}
                      {block.caseId?.personName || "Unknown case"}
                    </p>
                    <p>
                      <strong>Blocked by:</strong>{" "}
                      {block.blockedBy?.fullName || "Unknown user"}
                    </p>
                    <p>
                      <strong>Reason:</strong> {block.reason}
                    </p>

                    {block.otherReason ? (
                      <p>
                        <strong>Other reason:</strong> {block.otherReason}
                      </p>
                    ) : null}

                    <div className="owner-case-actions">
                      {block.caseId?._id ? (
                        <Link to={`/cases/${block.caseId._id}`}>View case</Link>
                      ) : null}

                      {block.blockedUser?._id ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(block.blockedUser._id)}
                          className="danger-link-button"
                        >
                          Delete user
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="page-card">
            <h2>All Users</h2>

            <div className="form-row">
              <label htmlFor="userSearch" className="form-label">
                Search users by name
              </label>
              <input
                id="userSearch"
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="e.g. Mobina"
                className="text-input"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <p>No users matched your search.</p>
            ) : (
              <div className="stack-list">
                {filteredUsers.map((platformUser) => (
                  <div key={platformUser._id} className="sub-card">
                    <p>
                      <strong>Name:</strong> {platformUser.fullName}
                    </p>
                    <p>
                      <strong>Email:</strong> {platformUser.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {platformUser.role}
                    </p>

                    {platformUser.role !== "moderator" ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(platformUser._id)}
                        className="danger-link-button"
                      >
                        Delete user
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}