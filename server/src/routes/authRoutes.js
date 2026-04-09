// Handles authentication routes like register, login, and temporary auth testing

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

    // Public registration should never be able to create moderator accounts
    const safeRole = role === "representative" ? "representative" : "public";

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: safeRole,
    });

    // Give the client a signed token straight after registration
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      token,
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

// Login an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    // Compare the typed password against the saved hash
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    // This token will be used later for protected routes
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      message: "Login successful",
      token,
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
      message: "Failed to log in",
      error: err.message,
    });
  }
});

export default router;