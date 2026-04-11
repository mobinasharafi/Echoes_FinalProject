// Stores case-specific user blocks made by a representative or moderator

import mongoose from "mongoose";

const caseBlockSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedBy: {
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
        "spam",
        "misinformation",
        "other",
      ],
      required: true,
    },
    otherReason: {
      type: String,
      trim: true,
      default: "",
    },
    // One user should only be blocked once per case
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

caseBlockSchema.index({ caseId: 1, blockedUser: 1 }, { unique: true });

const CaseBlock = mongoose.model("CaseBlock", caseBlockSchema);

export default CaseBlock;