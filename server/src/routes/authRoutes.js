// Handles login, registration, and personal account updates

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

function getPasswordValidationMessage() {
  return "For safety, passwords must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number. Echoes deals with sensitive information, so protecting your account helps us protect you too.";
}

function isStrongPassword(password) {
  if (typeof password !== "string") {
    return false;
  }

  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordPattern.test(password);
}

// Quick check that auth routes are proper
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

    const passwordHash = await bcrypt.hash("Test1234", 10);

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

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        ok: false,
        message: getPasswordValidationMessage(),
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

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

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

// Lets a logged-in user view their saved account details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    res.json({
      ok: true,
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
      message: "Failed to fetch personal information",
      error: err.message,
    });
  }
});

// Lets a logged-in user change their name or email
router.patch("/me/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        ok: false,
        message: "Full name and email are required",
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: "An account with this email already exists",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: fullName.trim(),
        email: trimmedEmail,
      },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    res.json({
      ok: true,
      message: "Personal information updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to update personal information",
      error: err.message,
    });
  }
});

// Lets a logged-in user change their password safely
router.patch("/me/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        ok: false,
        message: "Current password, new password, and confirmation are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        ok: false,
        message: "New passwords do not match",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        ok: false,
        message: getPasswordValidationMessage(),
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(400).json({
        ok: false,
        message: "Current password is incorrect",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      ok: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to update password",
      error: err.message,
    });
  }
});

export default router;