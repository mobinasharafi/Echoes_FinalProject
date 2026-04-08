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

// List published cases, with optional city and region filters
router.get("/", async (req, res) => {
  try {
    const { city, region } = req.query;

    const filter = {
      visibility: "published",
    };

    if (city) {
      filter.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (region) {
      filter.region = new RegExp(`^${region.trim()}$`, "i");
    }

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email role");

    res.json({
      ok: true,
      count: cases.length,
      cases,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch cases",
      error: err.message,
    });
  }
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