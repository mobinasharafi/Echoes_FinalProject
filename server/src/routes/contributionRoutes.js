// Handles contribution-related routes like leads and support messages on cases

import express from "express";
import Contribution from "../models/Contribution.js";
import Case from "../models/Case.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Temporary check that contribution routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Contribution routes are working",
  });
});

// Add a lead contribution to a case
router.post("/lead/:caseId", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const { caseId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Lead message is required",
      });
    }

    const existingCase = await Case.findById(caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    // Leads start as pending so they can be reviewed first
    const contribution = await Contribution.create({
      caseId,
      createdBy: req.user._id,
      type: "lead",
      message: message.trim(),
      moderationStatus: "pending",
    });

    res.status(201).json({
      ok: true,
      message: "Lead submitted successfully",
      contribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to submit lead",
      error: err.message,
    });
  }
});

// Add a support message to a case
router.post("/support/:caseId", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const { caseId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Support message is required",
      });
    }

    const existingCase = await Case.findById(caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    // Support messages are still moderated but separated from leads
    const contribution = await Contribution.create({
      caseId,
      createdBy: req.user._id,
      type: "support",
      message: message.trim(),
      moderationStatus: "pending",
    });

    res.status(201).json({
      ok: true,
      message: "Support message submitted successfully",
      contribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to submit support message",
      error: err.message,
    });
  }
});

// Moderators can view all pending contributions in one place
router.get(
  "/moderation/pending",
  authMiddleware,
  roleMiddleware("moderator"),
  async (req, res) => {
    try {
      const contributions = await Contribution.find({
        moderationStatus: "pending",
      })
        .sort({ createdAt: -1 })
        .populate("caseId", "personName city region")
        .populate("createdBy", "fullName email role");

      res.json({
        ok: true,
        count: contributions.length,
        contributions,
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: "Failed to fetch pending contributions",
        error: err.message,
      });
    }
  }
);

// Moderators can approve or reject a contribution
router.patch(
  "/moderation/:id",
  authMiddleware,
  roleMiddleware("moderator"),
  async (req, res) => {
    try {
      const { moderationStatus } = req.body;

      if (!["approved", "rejected"].includes(moderationStatus)) {
        return res.status(400).json({
          ok: false,
          message: "Moderation status must be approved or rejected",
        });
      }

      const contribution = await Contribution.findByIdAndUpdate(
        req.params.id,
        { moderationStatus },
        { new: true }
      )
        .populate("caseId", "personName city region")
        .populate("createdBy", "fullName email role");

      if (!contribution) {
        return res.status(404).json({
          ok: false,
          message: "Contribution not found",
        });
      }

      res.json({
        ok: true,
        message: `Contribution ${moderationStatus} successfully`,
        contribution,
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: "Failed to update contribution moderation status",
        error: err.message,
      });
    }
  }
);

export default router;