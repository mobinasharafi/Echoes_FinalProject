// Handles contribution-related routes like posting, reporting, replies, blocking, and moderation

import express from "express";
import Contribution from "../models/Contribution.js";
import Case from "../models/Case.js";
import CaseBlock from "../models/CaseBlock.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

function isCaseOwner(user, foundCase) {
  if (!user || !foundCase) {
    return false;
  }

  return String(foundCase.createdBy) === String(user._id);
}

function canManageCaseContributions(user, foundCase) {
  if (!user || !foundCase) {
    return false;
  }

  if (user.role === "moderator") {
    return true;
  }

  return isCaseOwner(user, foundCase);
}

function isActionableReason(reason) {
  return [
    "harassment",
    "threat",
    "victim_blaming",
    "misinformation",
  ].includes(reason);
}

async function getActiveCaseBlock(caseId, userId) {
  return CaseBlock.findOne({
    caseId,
    blockedUser: userId,
    isActive: true,
  });
}

// Temporary check that contribution routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Contribution routes are working",
  });
});

// Get visible contributions for one case
router.get("/case/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;

    const existingCase = await Case.findById(caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    const contributions = await Contribution.find({
      caseId,
      moderationStatus: "approved",
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName role");

    res.json({
      ok: true,
      count: contributions.length,
      contributions,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch contributions",
      error: err.message,
    });
  }
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

    if (isCaseOwner(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You cannot post a public contribution on your own case",
      });
    }

    const activeBlock = await getActiveCaseBlock(caseId, req.user._id);

    if (activeBlock) {
      return res.status(403).json({
        ok: false,
        message:
          "You cannot post on this case anymore because the case owner has blocked you.",
      });
    }

    const contribution = await Contribution.create({
      caseId,
      createdBy: req.user._id,
      type: "lead",
      message: message.trim(),
      moderationStatus: "approved",
    });

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate("createdBy", "fullName role");

    res.status(201).json({
      ok: true,
      message: "Lead submitted successfully",
      contribution: populatedContribution,
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

    if (isCaseOwner(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You cannot post a public contribution on your own case",
      });
    }

    const activeBlock = await getActiveCaseBlock(caseId, req.user._id);

    if (activeBlock) {
      return res.status(403).json({
        ok: false,
        message:
          "You cannot post on this case anymore because the case owner has blocked you.",
      });
    }

    const contribution = await Contribution.create({
      caseId,
      createdBy: req.user._id,
      type: "support",
      message: message.trim(),
      moderationStatus: "approved",
    });

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate("createdBy", "fullName role");

    res.status(201).json({
      ok: true,
      message: "Support message submitted successfully",
      contribution: populatedContribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to submit support message",
      error: err.message,
    });
  }
});

// Report a contribution
router.post("/:id/report", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const allowedReasons = [
      "harassment",
      "threat",
      "victim_blaming",
      "misinformation",
      "i_just_dont_like_this_comment",
    ];

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        ok: false,
        message: "Please choose a valid report reason",
      });
    }

    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    const existingCase = await Case.findById(contribution.caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (String(contribution.createdBy) === String(req.user._id)) {
      return res.status(400).json({
        ok: false,
        message: "You cannot report your own contribution",
      });
    }

    const alreadyReported = contribution.reports.some(
      (report) => String(report.reportedBy) === String(req.user._id)
    );

    if (alreadyReported) {
      return res.status(400).json({
        ok: false,
        message: "You have already reported this contribution",
      });
    }

    contribution.reports.push({
      reportedBy: req.user._id,
      reason,
    });

    contribution.actionableReportCount = contribution.reports.filter((report) =>
      isActionableReason(report.reason)
    ).length;

    if (contribution.actionableReportCount >= 5) {
      contribution.moderationStatus = "removed";
    }

    await contribution.save();

    const ignoredBySystem = reason === "i_just_dont_like_this_comment";

    res.json({
      ok: true,
      message:
        contribution.moderationStatus === "removed"
          ? "Contribution reported and automatically removed"
          : ignoredBySystem
          ? "Your report was recorded and will be reviewed, but it does not guarantee removal."
          : "Contribution reported successfully",
      contribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to report contribution",
      error: err.message,
    });
  }
});

// Block a user from posting on a specific case
router.post("/:id/block-user", authMiddleware, async (req, res) => {
  try {
    const { reason, otherReason = "" } = req.body;

    const allowedReasons = [
      "harassment",
      "threat",
      "victim_blaming",
      "spam",
      "misinformation",
      "other",
    ];

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        ok: false,
        message: "Please choose a valid block reason",
      });
    }

    if (reason === "other" && !otherReason.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Please add a short reason when choosing other",
      });
    }

    const contribution = await Contribution.findById(req.params.id).populate(
      "createdBy",
      "fullName email role"
    );

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    const existingCase = await Case.findById(contribution.caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (!canManageCaseContributions(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to block users on this case",
      });
    }

    if (String(contribution.createdBy._id) === String(existingCase.createdBy)) {
      return res.status(400).json({
        ok: false,
        message: "You cannot block the case owner from their own case",
      });
    }

    const existingBlock = await CaseBlock.findOne({
      caseId: existingCase._id,
      blockedUser: contribution.createdBy._id,
    });

    if (existingBlock && existingBlock.isActive) {
      return res.status(400).json({
        ok: false,
        message: "This user has already been blocked on this case",
      });
    }

    let blockRecord;

    if (existingBlock) {
      existingBlock.blockedBy = req.user._id;
      existingBlock.reason = reason;
      existingBlock.otherReason = reason === "other" ? otherReason.trim() : "";
      existingBlock.isActive = true;
      blockRecord = await existingBlock.save();
    } else {
      blockRecord = await CaseBlock.create({
        caseId: existingCase._id,
        blockedUser: contribution.createdBy._id,
        blockedBy: req.user._id,
        reason,
        otherReason: reason === "other" ? otherReason.trim() : "",
        isActive: true,
      });
    }

    const populatedBlock = await CaseBlock.findById(blockRecord._id)
      .populate("caseId", "personName city region")
      .populate("blockedUser", "fullName email role")
      .populate("blockedBy", "fullName email role");

    res.json({
      ok: true,
      message: "User blocked from this case successfully",
      block: populatedBlock,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to block user on this case",
      error: err.message,
    });
  }
});

// Representative or moderator can reply to a contribution on that case
router.patch("/:id/reply", authMiddleware, async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Reply message is required",
      });
    }

    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    const existingCase = await Case.findById(contribution.caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (!canManageCaseContributions(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to reply to this contribution",
      });
    }

    if (req.user.role === "moderator") {
      contribution.moderatorReply = reply.trim();
      contribution.moderatorRepliedAt = new Date();
    } else {
      contribution.representativeReply = reply.trim();
      contribution.representativeRepliedAt = new Date();
    }

    await contribution.save();

    const updatedContribution = await Contribution.findById(contribution._id)
      .populate("createdBy", "fullName role");

    res.json({
      ok: true,
      message: "Reply posted successfully",
      contribution: updatedContribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to post reply",
      error: err.message,
    });
  }
});

// Delete only the current role's reply
router.patch("/:id/delete-reply", authMiddleware, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    const existingCase = await Case.findById(contribution.caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (!canManageCaseContributions(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to delete this reply",
      });
    }

    if (req.user.role === "moderator") {
      if (!contribution.moderatorReply) {
        return res.status(400).json({
          ok: false,
          message: "There is no moderator reply to delete",
        });
      }

      contribution.moderatorReply = "";
      contribution.moderatorRepliedAt = null;
    } else {
      if (!contribution.representativeReply) {
        return res.status(400).json({
          ok: false,
          message: "There is no representative reply to delete",
        });
      }

      contribution.representativeReply = "";
      contribution.representativeRepliedAt = null;
    }

    await contribution.save();

    const updatedContribution = await Contribution.findById(contribution._id)
      .populate("createdBy", "fullName role");

    res.json({
      ok: true,
      message: "Reply deleted successfully",
      contribution: updatedContribution,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to delete reply",
      error: err.message,
    });
  }
});

// Representative or moderator can delete a contribution on that case
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        ok: false,
        message: "Contribution not found",
      });
    }

    const existingCase = await Case.findById(contribution.caseId);

    if (!existingCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (!canManageCaseContributions(req.user, existingCase)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to delete this contribution",
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