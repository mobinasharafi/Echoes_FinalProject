// Handles case-related routes like creating, listing, and viewing missing person cases

import express from "express";
import Case from "../models/Case.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Temporary check that case routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Case routes are working",
  });
});

// Create a new case - only representatives and moderators can do this
router.post(
  "/",
  authMiddleware,
  roleMiddleware("representative", "moderator"),
  async (req, res) => {
    try {
      const {
        personName,
        age,
        description,
        lastSeenDate,
        lastSeenLocation,
        city,
        region,
        photoUrl,
      } = req.body;

      if (
        !personName ||
        !description ||
        !lastSeenDate ||
        !lastSeenLocation ||
        !city ||
        !region
      ) {
        return res.status(400).json({
          ok: false,
          message: "Missing required case fields",
        });
      }

      const newCase = await Case.create({
        createdBy: req.user._id,
        personName: personName.trim(),
        age,
        description: description.trim(),
        lastSeenDate,
        lastSeenLocation: lastSeenLocation.trim(),
        city: city.trim(),
        region: region.trim(),
        photoUrl: photoUrl?.trim() || "",
      });

      res.status(201).json({
        ok: true,
        message: "Case created successfully",
        case: newCase,
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        message: "Failed to create case",
        error: err.message,
      });
    }
  }
);

export default router;