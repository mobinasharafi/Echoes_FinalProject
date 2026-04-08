// This file handles case-related routes like creating, listing, and viewing missing person cases

import express from "express";

const router = express.Router();

// Temporary check that case routes are connected properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Case routes are working",
  });
});

export default router;