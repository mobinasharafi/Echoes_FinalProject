// Gives the moderator one place to review reports, blocks, users, and cases

import express from "express";
import Contribution from "../models/Contribution.js";
import Case from "../models/Case.js";
import User from "../models/User.js";
import CaseBlock from "../models/CaseBlock.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes here are moderator-only
router.use(authMiddleware);
router.use(roleMiddleware("moderator"));

// Quick check that moderation routes are connected
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Moderation routes are working",
  });
});

// Get reported contributions with report details
router.get("/reports", async (req, res) => {
  try {
    const contributions = await Contribution.find({
      "reports.0": { $exists: true },
    })
      .sort({ updatedAt: -1 })
      .populate("caseId", "personName city region")
      .populate("createdBy", "fullName email role")
      .populate("reports.reportedBy", "fullName email role");

    res.json({
      ok: true,
      count: contributions.length,
      contributions,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch reported contributions",
      error: err.message,
    });
  }
});

// Get active case blocks
router.get("/blocks", async (req, res) => {
  try {
    const blocks = await CaseBlock.find({
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .populate("caseId", "personName city region")
      .populate("blockedUser", "fullName email role")
      .populate("blockedBy", "fullName email role");

    res.json({
      ok: true,
      count: blocks.length,
      blocks,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch case blocks",
      error: err.message,
    });
  }
});

// Get all users except password hashes
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json({
      ok: true,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch users",
      error: err.message,
    });
  }
});

// Moderator can delete a contribution from the platform
router.delete("/contributions/:id", async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    await Contribution.findByIdAndDelete(contribution._id);

    res.json({
      ok: true,
      message: "Contribution deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to delete contribution",
      error: err.message,
    });
  }
});

// Moderator can fully delete a user and clean up related data
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    if (user.role === "moderator") {
      return res.status(400).json({
        ok: false,
        message: "Moderator accounts cannot be deleted here",
      });
    }

    await Contribution.deleteMany({ createdBy: user._id });
    await CaseBlock.deleteMany({
      $or: [{ blockedUser: user._id }, { blockedBy: user._id }],
    });

    const userCases = await Case.find({ createdBy: user._id }).select("_id");
    const userCaseIds = userCases.map((caseItem) => caseItem._id);

    if (userCaseIds.length > 0) {
      await Contribution.deleteMany({ caseId: { $in: userCaseIds } });
      await CaseBlock.deleteMany({ caseId: { $in: userCaseIds } });
      await Case.deleteMany({ _id: { $in: userCaseIds } });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      ok: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to delete user",
      error: err.message,
    });
  }
});

export default router;