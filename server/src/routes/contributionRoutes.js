// Handles contribution-related routes like leads and support messages on cases
import express from "express";

const router = express.Router();

// Temporary check that contribution routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Contribution routes are working",
  });
});

export default router;