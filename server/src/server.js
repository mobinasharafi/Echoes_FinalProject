// Sets up the Express app, connects shared route files, and starts the backend server

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import TestEntry from "./models/TestEntry.js";
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";

dotenv.config();

const app = express();

// Parse incoming JSON
app.use(express.json());

// Keep CORS simple for local development
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Echoes API is running" });
});

// Temporary debug route to test DB writes
app.get("/api/debug/create-test", async (req, res) => {
  try {
    const entry = await TestEntry.create({
      message: "Test entry from Echoes backend",
    });

    res.json({
      ok: true,
      message: "Test entry created",
      entry,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to create test entry",
      error: err.message,
    });
  }
});

// Temporary debug route to read test entries
app.get("/api/debug/test-entries", async (req, res) => {
  try {
    const entries = await TestEntry.find().sort({ createdAt: -1 });

    res.json({
      ok: true,
      count: entries.length,
      entries,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch test entries",
      error: err.message,
    });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);

// Case routes
app.use("/api/cases", caseRoutes);

// Contribution routes
app.use("/api/contributions", contributionRoutes);

// Connect DB and start the server
async function start() {
  const PORT = process.env.PORT || 5000;
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.log("Missing MONGODB_URI in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Echoes API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Mongo connection failed:", err.message);
    process.exit(1);
  }
}

start();