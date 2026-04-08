// Handles contribution-related routes like leads and support messages on cases

import express from "express";
import Contribution from "../models/Contribution.js";
import Case from "../models/Case.js";
import authMiddleware from "../middleware/authMiddleware.js";

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

export default router;