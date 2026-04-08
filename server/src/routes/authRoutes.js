import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// Quick check that auth routes are wired in properly
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Auth routes are working",
  });
});

// Temporary browser-friendly route to test user creation
router.get("/debug-register", async (req, res) => {
  try {
    const email = "testuser@echoes.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        ok: true,
        message: "Test user already exists",
        user: {
          id: existingUser._id,
          fullName: existingUser.fullName,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }

    // This lets us confirm password hashing is working too
    const passwordHash = await bcrypt.hash("test1234", 10);

    const user = await User.create({
      fullName: "Echoes Test User",
      email,
      passwordHash,
      role: "public",
    });

    res.status(201).json({
      ok: true,
      message: "Test user created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to create test user",
      error: err.message,
    });
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Full name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: "An account with this email already exists",
      });
    }

    // Store the password safely instead of saving it raw
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || "public",
    });

    // Send back only the fields the frontend actually needs
    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to register user",
      error: err.message,
    });
  }
});

export default router;