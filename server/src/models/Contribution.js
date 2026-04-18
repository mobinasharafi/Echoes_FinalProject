// Stores public case contributions, reports, and separate replies from the representative and moderator

import mongoose from "mongoose";

const contributionReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "harassment",
        "threat",
        "victim_blaming",
        "misinformation",
        "i_just_dont_like_this_comment",
      ],
      required: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

// This stores the back-and-forth conversation under one original contribution
const contributionReplySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["public", "representative", "moderator"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const contributionSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lead", "support"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    representativeReply: {
      type: String,
      trim: true,
      default: "",
    },
    representativeRepliedAt: {
      type: Date,
      default: null,
    },
    moderatorReply: {
      type: String,
      trim: true,
      default: "",
    },
    moderatorRepliedAt: {
      type: Date,
      default: null,
    },
    // Keeping the older single-reply fields above for compatibility but this array is what lets the conversation continue back and forth
    replies: [contributionReplySchema],
    reports: [contributionReportSchema],
    actionableReportCount: {
      type: Number,
      default: 0,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "removed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;