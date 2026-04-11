// Handles case-related routes like creating, listing, viewing, editing, and deleting missing person cases

import express from "express";
import Case from "../models/Case.js";
import Contribution from "../models/Contribution.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

function canManageCase(user, foundCase) {
  if (!user || !foundCase) {
    return false;
  }

  if (user.role === "moderator") {
    return true;
  }

  return String(foundCase.createdBy) === String(user._id);
}

// Turn a written place into map coordinates before saving the case
async function geocodeLocation(lastSeenLocation, city, region = "") {
  const locationParts = [lastSeenLocation, city, region, "UK"].filter(Boolean);
  const query = locationParts.join(", ");

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gb&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Echoes/1.0 (student project geocoding)",
    },
  });

  if (!response.ok) {
    throw new Error("Location lookup failed");
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(
      "We could not recognise that location clearly. Please enter a more specific UK location."
    );
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
}

// Temporary check that case routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Case routes are working",
  });
});

// List published cases, with optional city filter
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    const filter = {
      visibility: "published",
    };

    if (city) {
      filter.city = new RegExp(`^${city.trim()}$`, "i");
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

// Get the logged-in representative or moderator's active cases
router.get("/mine/active", authMiddleware, async (req, res) => {
  try {
    const filter =
      req.user.role === "moderator"
        ? { status: "open", visibility: "published" }
        : {
            createdBy: req.user._id,
            status: "open",
            visibility: "published",
          };

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
      message: "Failed to fetch active cases",
      error: err.message,
    });
  }
});

// Get one case by id
router.get("/:id", async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id).populate(
      "createdBy",
      "fullName email role"
    );

    if (!foundCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    res.json({
      ok: true,
      case: foundCase,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch case",
      error: err.message,
    });
  }
});

// Create a new case - only representatives and moderators can do this
router.post(
  "/",
  authMiddleware,
  roleMiddleware("representative", "moderator"),
  upload.single("photo"),
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
      } = req.body;

      if (
        !personName ||
        !description ||
        !lastSeenDate ||
        !lastSeenLocation ||
        !city
      ) {
        return res.status(400).json({
          ok: false,
          message: "Missing required case fields",
        });
      }

      const photoUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const coordinates = await geocodeLocation(
        lastSeenLocation.trim(),
        city.trim(),
        region?.trim() || ""
      );

      const newCase = await Case.create({
        createdBy: req.user._id,
        personName: personName.trim(),
        age: age ? Number(age) : undefined,
        description: description.trim(),
        lastSeenDate,
        lastSeenLocation: lastSeenLocation.trim(),
        city: city.trim(),
        region: region?.trim() || "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        photoUrl,
        visibility: "published",
      });

      res.status(201).json({
        ok: true,
        message: "Case created successfully",
        case: newCase,
      });
    } catch (err) {
      const statusCode =
        err.message ===
        "We could not recognise that location clearly. Please enter a more specific UK location."
          ? 400
          : 500;

      res.status(statusCode).json({
        ok: false,
        message: "Failed to create case",
        error: err.message,
      });
    }
  }
);

// Edit a case - allowed for the case owner or a moderator
router.patch(
  "/:id",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      const foundCase = await Case.findById(req.params.id);

      if (!foundCase) {
        return res.status(404).json({
          ok: false,
          message: "Case not found",
        });
      }

      if (!canManageCase(req.user, foundCase)) {
        return res.status(403).json({
          ok: false,
          message: "You do not have permission to edit this case",
        });
      }

      const {
        personName,
        age,
        description,
        lastSeenDate,
        lastSeenLocation,
        city,
        region,
        status,
        visibility,
      } = req.body;

      if (personName !== undefined) {
        foundCase.personName = personName.trim();
      }

      if (age !== undefined) {
        foundCase.age = age === "" ? undefined : Number(age);
      }

      if (description !== undefined) {
        foundCase.description = description.trim();
      }

      if (lastSeenDate !== undefined) {
        foundCase.lastSeenDate = lastSeenDate;
      }

      if (lastSeenLocation !== undefined) {
        foundCase.lastSeenLocation = lastSeenLocation.trim();
      }

      if (city !== undefined) {
        foundCase.city = city.trim();
      }

      if (region !== undefined) {
        foundCase.region = region.trim();
      }

      if (status !== undefined && ["open", "resolved"].includes(status)) {
        foundCase.status = status;
      }

      if (
        visibility !== undefined &&
        ["draft", "published"].includes(visibility)
      ) {
        foundCase.visibility = visibility;
      }

      if (
        lastSeenLocation !== undefined ||
        city !== undefined ||
        region !== undefined
      ) {
        const updatedCoordinates = await geocodeLocation(
          foundCase.lastSeenLocation,
          foundCase.city,
          foundCase.region
        );

        foundCase.latitude = updatedCoordinates.latitude;
        foundCase.longitude = updatedCoordinates.longitude;
      }

      if (req.file) {
        foundCase.photoUrl = `/uploads/${req.file.filename}`;
      }

      await foundCase.save();

      const updatedCase = await Case.findById(foundCase._id).populate(
        "createdBy",
        "fullName email role"
      );

      res.json({
        ok: true,
        message: "Case updated successfully",
        case: updatedCase,
      });
    } catch (err) {
      const statusCode =
        err.message ===
        "We could not recognise that location clearly. Please enter a more specific UK location."
          ? 400
          : 500;

      res.status(statusCode).json({
        ok: false,
        message: "Failed to update case",
        error: err.message,
      });
    }
  }
);

// Delete a case - allowed for the case owner or a moderator
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.id);

    if (!foundCase) {
      return res.status(404).json({
        ok: false,
        message: "Case not found",
      });
    }

    if (!canManageCase(req.user, foundCase)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to delete this case",
      });
    }

    await Contribution.deleteMany({ caseId: foundCase._id });
    await Case.findByIdAndDelete(foundCase._id);

    res.json({
      ok: true,
      message: "Case deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to delete case",
      error: err.message,
    });
  }
});

export default router;