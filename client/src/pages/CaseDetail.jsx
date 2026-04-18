// Shows one case, lets people contribute, and lets owners manage replies, reports, and blocks

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  copyText,
  getFileUrl,
} from "../api.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function buildUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

const reportReasonOptions = [
  { value: "harassment", label: "Harassment" },
  { value: "threat", label: "Threat" },
  { value: "victim_blaming", label: "Victim blaming" },
  { value: "misinformation", label: "Misinformation" },
  {
    value: "i_just_dont_like_this_comment",
    label: "I just don't like this comment",
  },
];

const blockReasonOptions = [
  { value: "harassment", label: "Harassment" },
  { value: "threat", label: "Threat" },
  { value: "victim_blaming", label: "Victim blaming" },
  { value: "spam", label: "Spam" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
];

function hasRepresentativeResponse(contribution) {
  if (contribution.representativeReply?.trim()) {
    return true;
  }

  return (contribution.replies || []).some(
    (reply) => reply.role === "representative"
  );
}

function getReplyHeading(replyRole, replyUserName) {
  if (replyRole === "representative") {
    return "Reply from authorised representative";
  }

  if (replyRole === "moderator") {
    return "Reply from Website Moderator";
  }

  return `Reply from ${replyUserName || "Echoes user"}`;
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseItem, setCaseItem] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [leadMessage, setLeadMessage] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingLead, setPostingLead] = useState(false);
  const [postingSupport, setPostingSupport] = useState(false);
  const [updatingCase, setUpdatingCase] = useState(false);
  const [deletingCase, setDeletingCase] = useState(false);
  const [deletingContributionId, setDeletingContributionId] = useState("");
  const [blockingContributionId, setBlockingContributionId] = useState("");
  const [postingThreadReplyId, setPostingThreadReplyId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [openReportBoxId, setOpenReportBoxId] = useState("");
  const [openBlockBoxId, setOpenBlockBoxId] = useState("");
  const [openThreadReplyBoxId, setOpenThreadReplyBoxId] = useState("");
  const [isBlockedOnCase, setIsBlockedOnCase] = useState(false);
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [ownerActionError, setOwnerActionError] = useState("");
  const [ownerActionSuccess, setOwnerActionSuccess] = useState("");
  const [reportDrafts, setReportDrafts] = useState({});
  const [blockDrafts, setBlockDrafts] = useState({});
  const [threadReplyDrafts, setThreadReplyDrafts] = useState({});
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editForm, setEditForm] = useState({
    personName: "",
    age: "",
    description: "",
    lastSeenDate: "",
    lastSeenLocation: "",
    city: "",
    region: "",
    status: "open",
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const isOwner =
    user &&
    caseItem &&
    (user.role === "moderator" || user.id === caseItem.createdBy?._id);

  const canBlockUsers =
    user &&
    caseItem &&
    user.role === "representative" &&
    user.id === caseItem.createdBy?._id;

  const fetchCaseAndContributions = async () => {
    try {
      setLoading(true);
      setError("");

      const [caseData, contributionData] = await Promise.all([
        apiGet(`/api/cases/${id}`),
        apiGet(`/api/contributions/case/${id}`),
      ]);

      const foundCase = caseData.case;

      setCaseItem(foundCase);
      setContributions(contributionData.contributions || []);
      setEditForm({
        personName: foundCase.personName || "",
        age:
          foundCase.age === undefined || foundCase.age === null
            ? ""
            : String(foundCase.age),
        description: foundCase.description || "",
        lastSeenDate: foundCase.lastSeenDate
          ? new Date(foundCase.lastSeenDate).toISOString().slice(0, 10)
          : "",
        lastSeenLocation: foundCase.lastSeenLocation || "",
        city: foundCase.city || "",
        region: foundCase.region || "",
        status: foundCase.status || "open",
      });
      setEditPhotoFile(null);
    } catch (err) {
      setError(err.message || "Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseAndContributions();
  }, [id]);

  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (!user) {
        setIsBlockedOnCase(false);
        return;
      }

      try {
        const data = await apiGet(
          `/api/contributions/case/${id}/block-status`,
          true
        );

        setIsBlockedOnCase(Boolean(data.isBlocked));
      } catch {
        setIsBlockedOnCase(false);
      }
    };

    fetchBlockStatus();
  }, [id, user]);

  useEffect(() => {
    if (isOwner) {
      localStorage.setItem(`lastViewedCase_${id}`, new Date().toISOString());
    }
  }, [id, isOwner, contributions.length]);

  const handleLeadSubmit = async (event) => {
    event.preventDefault();
    setPostingLead(true);
    setPostError("");
    setPostSuccess("");

    try {
      const data = await apiPost(
        `/api/contributions/lead/${id}`,
        { message: leadMessage },
        true
      );

      setContributions((prev) => [data.contribution, ...prev]);
      setLeadMessage("");
      setPostSuccess("Your lead has been posted.");
    } catch (err) {
      setPostError(err.message || "Failed to post lead");
    } finally {
      setPostingLead(false);
    }
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    setPostingSupport(true);
    setPostError("");
    setPostSuccess("");

    try {
      const data = await apiPost(
        `/api/contributions/support/${id}`,
        { message: supportMessage },
        true
      );

      setContributions((prev) => [data.contribution, ...prev]);
      setSupportMessage("");
      setPostSuccess("Your support message has been posted.");
    } catch (err) {
      setPostError(err.message || "Failed to post support message");
    } finally {
      setPostingSupport(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditPhotoChange = (event) => {
    const selectedFile = event.target.files[0] || null;
    setEditPhotoFile(selectedFile);
  };

  const handleCaseUpdate = async (event) => {
    event.preventDefault();
    setUpdatingCase(true);
    setOwnerActionError("");
    setOwnerActionSuccess("");

    try {
      const updateData = new FormData();

      updateData.append("personName", editForm.personName);
      updateData.append("age", editForm.age);
      updateData.append("description", editForm.description);
      updateData.append("lastSeenDate", editForm.lastSeenDate);
      updateData.append("lastSeenLocation", editForm.lastSeenLocation);
      updateData.append("city", editForm.city);
      updateData.append("region", editForm.region);
      updateData.append("status", editForm.status);

      if (editPhotoFile) {
        updateData.append("photo", editPhotoFile);
      }

      const response = await fetch(buildUrl(`/api/cases/${id}`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to update case"
        );
      }

      const updatedCase = data.case;

      setCaseItem(updatedCase);
      setEditForm({
        personName: updatedCase.personName || "",
        age:
          updatedCase.age === undefined || updatedCase.age === null
            ? ""
            : String(updatedCase.age),
        description: updatedCase.description || "",
        lastSeenDate: updatedCase.lastSeenDate
          ? new Date(updatedCase.lastSeenDate).toISOString().slice(0, 10)
          : "",
        lastSeenLocation: updatedCase.lastSeenLocation || "",
        city: updatedCase.city || "",
        region: updatedCase.region || "",
        status: updatedCase.status || "open",
      });
      setEditPhotoFile(null);
      setOwnerActionSuccess("Case updated successfully.");
      setShowEditForm(false);
    } catch (err) {
      setOwnerActionError(err.message || "Failed to update case");
    } finally {
      setUpdatingCase(false);
    }
  };

  const handleCaseDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case? This will also delete all contributions on it."
    );

    if (!confirmed) {
      return;
    }

    setDeletingCase(true);
    setOwnerActionError("");
    setOwnerActionSuccess("");

    try {
      await apiDelete(`/api/cases/${id}`, true);
      navigate("/browse");
    } catch (err) {
      setOwnerActionError(err.message || "Failed to delete case");
      setDeletingCase(false);
    }
  };

  const handleContributionDelete = async (contributionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contribution?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingContributionId(contributionId);
    setOwnerActionError("");
    setOwnerActionSuccess("");

    try {
      await apiDelete(`/api/contributions/${contributionId}`, true);

      setContributions((prev) =>
        prev.filter((item) => item._id !== contributionId)
      );

      setOwnerActionSuccess("Contribution deleted successfully.");
    } catch (err) {
      setOwnerActionError(err.message || "Failed to delete contribution");
    } finally {
      setDeletingContributionId("");
    }
  };

  const toggleMenu = (contributionId) => {
    setOpenMenuId((prev) => (prev === contributionId ? "" : contributionId));
    setOpenReportBoxId("");
    setOpenBlockBoxId("");
  };

  const handleCopyContribution = async (message) => {
    try {
      await copyText(message);
      setPostSuccess("Contribution copied.");
      setPostError("");
    } catch {
      setPostError("Failed to copy contribution.");
    } finally {
      setOpenMenuId("");
    }
  };

  const handleCopyCaseLink = async () => {
    try {
      await copyText(window.location.href);
      setPostSuccess("Case link copied.");
      setPostError("");
    } catch {
      setPostError("Failed to copy case link.");
    } finally {
      setOpenMenuId("");
    }
  };

  const handleReportDraftChange = (contributionId, value) => {
    setReportDrafts((prev) => ({
      ...prev,
      [contributionId]: value,
    }));
  };

  const handleOpenReportBox = (contributionId) => {
    setOpenReportBoxId((prev) => (prev === contributionId ? "" : contributionId));
    setOpenBlockBoxId("");
    setReportDrafts((prev) => ({
      ...prev,
      [contributionId]: prev[contributionId] || "harassment",
    }));
  };

  const handleReportContribution = async (contributionId) => {
    if (!user) {
      setPostError("You need to be logged in to report a contribution.");
      setPostSuccess("");
      setOpenMenuId("");
      return;
    }

    const reason = reportDrafts[contributionId];

    if (!reason) {
      setPostError("Please choose a report reason.");
      setPostSuccess("");
      return;
    }

    try {
      const data = await apiPost(
        `/api/contributions/${contributionId}/report`,
        { reason },
        true
      );

      if (data.contribution?.moderationStatus === "removed") {
        setContributions((prev) =>
          prev.filter((item) => item._id !== contributionId)
        );
      }

      if (
        data.message ===
        "Your report was recorded and will be reviewed, but it does not guarantee removal."
      ) {
        setPostError(data.message);
        setPostSuccess("");
      } else {
        setPostSuccess(data.message || "Contribution reported successfully.");
        setPostError("");
      }

      setOpenReportBoxId("");
    } catch (err) {
      setPostError(err.message || "Failed to report contribution.");
      setPostSuccess("");
    } finally {
      setOpenMenuId("");
    }
  };

  const handleBlockDraftChange = (contributionId, field, value) => {
    setBlockDrafts((prev) => ({
      ...prev,
      [contributionId]: {
        reason: prev[contributionId]?.reason || "harassment",
        otherReason: prev[contributionId]?.otherReason || "",
        [field]: value,
      },
    }));
  };

  const handleOpenBlockBox = (contributionId) => {
    setOpenBlockBoxId((prev) => (prev === contributionId ? "" : contributionId));
    setOpenReportBoxId("");
    setBlockDrafts((prev) => ({
      ...prev,
      [contributionId]: prev[contributionId] || {
        reason: "harassment",
        otherReason: "",
      },
    }));
  };

  const handleBlockUser = async (contributionId) => {
    const draft = blockDrafts[contributionId] || {
      reason: "harassment",
      otherReason: "",
    };

    const confirmed = window.confirm(
      "When you block this person, they will no longer be able to contribute to your case. Are you sure you want to block them?"
    );

    if (!confirmed) {
      return;
    }

    setBlockingContributionId(contributionId);
    setOwnerActionError("");
    setOwnerActionSuccess("");

    try {
      await apiPost(
        `/api/contributions/${contributionId}/block-user`,
        {
          reason: draft.reason,
          otherReason: draft.otherReason,
        },
        true
      );

      setOwnerActionSuccess("User blocked from posting on this case.");
      setOpenBlockBoxId("");
      setOpenMenuId("");
    } catch (err) {
      setOwnerActionError(err.message || "Failed to block user.");
    } finally {
      setBlockingContributionId("");
    }
  };

  const handleThreadReplyDraftChange = (contributionId, value) => {
    setThreadReplyDrafts((prev) => ({
      ...prev,
      [contributionId]: value,
    }));
  };

  // The commenter can only join after the representative has replied once.
  // The backend checks this too, but this keeps the UI cleaner.
  const canUserReplyInThread = (contribution) => {
    if (!user) {
      return false;
    }

    if (isOwner) {
      return true;
    }

    const isOriginalCommenter =
      user.id === contribution.createdBy?._id;

    if (!isOriginalCommenter) {
      return false;
    }

    return hasRepresentativeResponse(contribution);
  };

  const handleThreadReplySubmit = async (contributionId) => {
    const message = (threadReplyDrafts[contributionId] || "").trim();

    if (!message) {
      setOwnerActionError("");
      setPostError("Reply message is required.");
      return;
    }

    setPostingThreadReplyId(contributionId);
    setOwnerActionError("");
    setOwnerActionSuccess("");
    setPostError("");
    setPostSuccess("");

    try {
      const data = await apiPost(
        `/api/contributions/${contributionId}/thread-reply`,
        { message },
        true
      );

      setContributions((prev) =>
        prev.map((item) =>
          item._id === contributionId ? data.contribution : item
        )
      );

      setThreadReplyDrafts((prev) => ({
        ...prev,
        [contributionId]: "",
      }));

      setOpenThreadReplyBoxId("");

      if (isOwner) {
        setOwnerActionSuccess("Reply posted successfully.");
      } else {
        setPostSuccess("Reply posted successfully.");
      }
    } catch (err) {
      if (isOwner) {
        setOwnerActionError(err.message || "Failed to post reply.");
      } else {
        setPostError(err.message || "Failed to post reply.");
      }
    } finally {
      setPostingThreadReplyId("");
    }
  };

  if (loading) {
    return <p>Loading case details...</p>;
  }

  if (error) {
    return <p className="status-error">{error}</p>;
  }

  if (!caseItem) {
    return <p>Case not found.</p>;
  }

  const imageUrl = caseItem.photoUrl ? getFileUrl(caseItem.photoUrl) : "";

  return (
    <div className="page-shell">
      <h1 className="page-title">Case Details</h1>

      <div className="page-card">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={caseItem.personName}
            className="case-image-large"
          />
        ) : null}

        <h2>{caseItem.personName}</h2>

        {caseItem.age !== undefined && caseItem.age !== null && (
          <p>
            <strong>Age:</strong> {caseItem.age}
          </p>
        )}

        <p>
          <strong>Last seen date:</strong>{" "}
          {new Date(caseItem.lastSeenDate).toLocaleDateString()}
        </p>

        <p>
          <strong>Last seen location:</strong> {caseItem.lastSeenLocation}
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
          <strong>Status:</strong> {caseItem.status}
        </p>

        {caseItem.createdBy?.fullName ? (
          <p>
            <strong>Posted by:</strong> {caseItem.createdBy.fullName}
          </p>
        ) : null}

        <p>
          <strong>Description:</strong> {caseItem.description}
        </p>

        {isOwner ? (
          <div className="owner-case-actions">
            <button
              type="button"
              onClick={() => setShowEditForm((prev) => !prev)}
              className="owner-link-button"
            >
              {showEditForm
                ? "Hide changes form"
                : "Make changes to your case"}
            </button>

            <button
              type="button"
              onClick={handleCaseDelete}
              disabled={deletingCase}
              className="owner-link-button"
            >
              {deletingCase ? "Deleting..." : "Delete this case"}
            </button>
          </div>
        ) : null}
      </div>

      {isOwner && showEditForm ? (
        <div className="page-card">
          <h2>Make Changes to Your Case</h2>

          <form onSubmit={handleCaseUpdate}>
            <div className="form-row">
              <label htmlFor="personName" className="form-label">
                Missing person name
              </label>
              <input
                id="personName"
                name="personName"
                type="text"
                value={editForm.personName}
                onChange={handleEditChange}
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
                min="0"
                value={editForm.age}
                onChange={handleEditChange}
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label htmlFor="lastSeenDate" className="form-label">
                Date last seen
              </label>
              <input
                id="lastSeenDate"
                name="lastSeenDate"
                type="date"
                value={editForm.lastSeenDate}
                onChange={handleEditChange}
                required
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label htmlFor="lastSeenLocation" className="form-label">
                Last seen location
              </label>
              <input
                id="lastSeenLocation"
                name="lastSeenLocation"
                type="text"
                value={editForm.lastSeenLocation}
                onChange={handleEditChange}
                required
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={editForm.city}
                onChange={handleEditChange}
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
                value={editForm.region}
                onChange={handleEditChange}
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label htmlFor="status" className="form-label">
                Case status
              </label>
              <select
                id="status"
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="select-input"
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows="6"
                required
                className="text-area"
              />
            </div>

            <div className="form-row">
              <label htmlFor="editPhoto" className="form-label">
                Change photo
              </label>
              <input
                id="editPhoto"
                name="editPhoto"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleEditPhotoChange}
                className="file-input"
              />
              <p className="helper-text">
                Upload a new JPG, PNG, or WEBP image only if you want to replace
                the current one.
              </p>
            </div>

            <div className="inline-actions">
              <button
                type="submit"
                disabled={updatingCase}
                className="primary-button"
              >
                {updatingCase ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!isOwner ? (
        <div className="page-card">
          <h2>Contribute</h2>
          <p className="page-intro">
            Please be kind, careful, and responsible when posting. Harmful or
            abusive behaviour has no place on Echoes. Repeated reports from users
            may lead to your account being reviewed by a moderator and
            permanently banned.
          </p>

          {!user ? (
            <p>You need to be logged in to post a contribution.</p>
          ) : isBlockedOnCase ? (
            <p className="status-error">
              You have been blocked by the case owner, so you can no longer
              interact with this case.
            </p>
          ) : (
            <div className="stack-list">
              <div className="sub-card">
                <h3>Leads & Information</h3>
                <p>
                  Use this section for sightings, practical information, or
                  anything that may help with the case directly.
                </p>

                <form onSubmit={handleLeadSubmit}>
                  <textarea
                    value={leadMessage}
                    onChange={(event) => setLeadMessage(event.target.value)}
                    rows="4"
                    required
                    className="text-area"
                  />
                  <button
                    type="submit"
                    disabled={postingLead}
                    className="primary-button"
                    style={{ marginTop: "12px" }}
                  >
                    {postingLead ? "Posting..." : "Post lead"}
                  </button>
                </form>
              </div>

              <div className="sub-card">
                <h3>Support & Compassion</h3>
                <p>
                  Use this section for respectful support, solidarity, or
                  thoughtful words for the family and loved ones.
                </p>

                <form onSubmit={handleSupportSubmit}>
                  <textarea
                    value={supportMessage}
                    onChange={(event) => setSupportMessage(event.target.value)}
                    rows="4"
                    required
                    className="text-area"
                  />
                  <button
                    type="submit"
                    disabled={postingSupport}
                    className="primary-button"
                    style={{ marginTop: "12px" }}
                  >
                    {postingSupport ? "Posting..." : "Post support message"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {postError && <p className="status-error">{postError}</p>}
          {postSuccess && <p className="status-success">{postSuccess}</p>}
        </div>
      ) : null}

      {(ownerActionError || ownerActionSuccess) && (
        <div className="page-card">
          {ownerActionError && <p className="status-error">{ownerActionError}</p>}
          {ownerActionSuccess && (
            <p className="status-success">{ownerActionSuccess}</p>
          )}
        </div>
      )}

      <div className="page-card">
        <h2>Posted Contributions</h2>

        {contributions.length === 0 ? (
          <p>No contributions have been posted yet.</p>
        ) : (
          <div className="stack-list">
            {contributions.map((contribution) => {
              const isOwnContribution =
                user && user.id === contribution.createdBy?._id;

              const isOriginalCommenter =
                user && user.id === contribution.createdBy?._id;

              const canReplyInThread = canUserReplyInThread(contribution);

              const reportDraftValue =
                reportDrafts[contribution._id] || "harassment";

              const blockDraftValue = blockDrafts[contribution._id] || {
                reason: "harassment",
                otherReason: "",
              };

              const threadReplies = contribution.replies || [];

              return (
                <div key={contribution._id} className="sub-card contribution-card">
                  <div className="contribution-top-row">
                    <p>
                      <strong>
                        {contribution.type === "lead"
                          ? "Leads & Information"
                          : "Support & Compassion"}
                      </strong>
                    </p>

                    <div className="contribution-menu-wrap">
                      <button
                        type="button"
                        className="menu-dots-button"
                        onClick={() => toggleMenu(contribution._id)}
                      >
                        ⋯
                      </button>

                      {openMenuId === contribution._id ? (
                        <div className="menu-dropdown">
                          <button
                            type="button"
                            className="menu-dropdown-item"
                            onClick={() =>
                              handleCopyContribution(contribution.message)
                            }
                          >
                            Copy
                          </button>

                          <button
                            type="button"
                            className="menu-dropdown-item"
                            onClick={handleCopyCaseLink}
                          >
                            Copy case link
                          </button>

                          {!isOwner ? (
                            <button
                              type="button"
                              className="menu-dropdown-item"
                              onClick={() => handleOpenReportBox(contribution._id)}
                              disabled={isOwnContribution}
                            >
                              Report
                            </button>
                          ) : null}

                          {canBlockUsers && !isOwnContribution ? (
                            <button
                              type="button"
                              className="menu-dropdown-item"
                              onClick={() => handleOpenBlockBox(contribution._id)}
                            >
                              Block user
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {openReportBoxId === contribution._id ? (
                    <div className="report-box">
                      <label
                        htmlFor={`report-reason-${contribution._id}`}
                        className="form-label"
                        style={{ textAlign: "left" }}
                      >
                        Why are you reporting this comment?
                      </label>
                      <select
                        id={`report-reason-${contribution._id}`}
                        value={reportDraftValue}
                        onChange={(event) =>
                          handleReportDraftChange(
                            contribution._id,
                            event.target.value
                          )
                        }
                        className="select-input"
                      >
                        {reportReasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div
                        className="inline-actions"
                        style={{ justifyContent: "flex-start", marginTop: "12px" }}
                      >
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleReportContribution(contribution._id)}
                        >
                          Submit report
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {openBlockBoxId === contribution._id ? (
                    <div className="report-box">
                      <label
                        htmlFor={`block-reason-${contribution._id}`}
                        className="form-label"
                        style={{ textAlign: "left" }}
                      >
                        Why are you blocking this user from your case?
                      </label>
                      <select
                        id={`block-reason-${contribution._id}`}
                        value={blockDraftValue.reason}
                        onChange={(event) =>
                          handleBlockDraftChange(
                            contribution._id,
                            "reason",
                            event.target.value
                          )
                        }
                        className="select-input"
                      >
                        {blockReasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {blockDraftValue.reason === "other" ? (
                        <div style={{ marginTop: "12px" }}>
                          <label
                            htmlFor={`block-other-${contribution._id}`}
                            className="form-label"
                            style={{ textAlign: "left" }}
                          >
                            Short reason
                          </label>
                          <textarea
                            id={`block-other-${contribution._id}`}
                            value={blockDraftValue.otherReason}
                            onChange={(event) =>
                              handleBlockDraftChange(
                                contribution._id,
                                "otherReason",
                                event.target.value
                              )
                            }
                            rows="3"
                            className="text-area"
                          />
                        </div>
                      ) : null}

                      <div
                        className="inline-actions"
                        style={{ justifyContent: "flex-start", marginTop: "12px" }}
                      >
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleBlockUser(contribution._id)}
                          disabled={blockingContributionId === contribution._id}
                        >
                          {blockingContributionId === contribution._id
                            ? "Blocking..."
                            : "Block this user"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <p>{contribution.message}</p>

                  <p className="helper-text">
                    Posted by {contribution.createdBy?.fullName || "Echoes user"}
                  </p>

                  {/* These older reply fields are still shown so nothing disappears
                     from contributions that were created before the threaded reply system */}
                  {contribution.representativeReply ? (
                    <div className="sub-card" style={{ marginTop: "14px" }}>
                      <p>
                        <strong>Reply from authorised representative</strong>
                      </p>
                      <p>{contribution.representativeReply}</p>
                    </div>
                  ) : null}

                  {contribution.moderatorReply ? (
                    <div className="sub-card" style={{ marginTop: "14px" }}>
                      <p>
                        <strong>Reply from Website Moderator</strong>
                      </p>
                      <p>{contribution.moderatorReply}</p>
                    </div>
                  ) : null}

                  {threadReplies.length > 0 ? (
                    <div style={{ marginTop: "14px" }}>
                      {threadReplies.map((reply) => (
                        <div
                          key={reply._id}
                          className="sub-card"
                          style={{ marginTop: "10px" }}
                        >
                          <p>
                            <strong>
                              {getReplyHeading(
                                reply.role,
                                reply.createdBy?.fullName
                              )}
                            </strong>
                          </p>
                          <p>{reply.message}</p>
                          <p className="helper-text">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {(isOwner || isOriginalCommenter) ? (
                    <div className="contribution-owner-actions">
                      {canReplyInThread ? (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenThreadReplyBoxId((prev) =>
                              prev === contribution._id ? "" : contribution._id
                            )
                          }
                          className="owner-link-button"
                        >
                          Reply
                        </button>
                      ) : isOriginalCommenter ? (
                        <p className="helper-text">
                          You can reply once the authorised representative has
                          responded.
                        </p>
                      ) : null}

                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleContributionDelete(contribution._id)
                          }
                          disabled={deletingContributionId === contribution._id}
                          className="danger-link-button"
                        >
                          {deletingContributionId === contribution._id
                            ? "Deleting..."
                            : "Delete contribution"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {openThreadReplyBoxId === contribution._id ? (
                    <div style={{ marginTop: "16px" }}>
                      <label
                        htmlFor={`thread-reply-${contribution._id}`}
                        className="form-label"
                        style={{ textAlign: "left" }}
                      >
                        Reply
                      </label>
                      <textarea
                        id={`thread-reply-${contribution._id}`}
                        value={threadReplyDrafts[contribution._id] || ""}
                        onChange={(event) =>
                          handleThreadReplyDraftChange(
                            contribution._id,
                            event.target.value
                          )
                        }
                        rows="3"
                        className="text-area"
                      />

                      <div
                        className="inline-actions"
                        style={{ justifyContent: "flex-start", marginTop: "12px" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleThreadReplySubmit(contribution._id)}
                          disabled={postingThreadReplyId === contribution._id}
                          className="primary-button"
                        >
                          {postingThreadReplyId === contribution._id
                            ? "Posting..."
                            : "Post reply"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}