const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route  POST /api/auth/login
// @access Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: "Account deactivated. Contact admin." });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        monthlyDonation: user.monthlyDonation,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route  GET /api/auth/me
// @access Private
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route  POST /api/auth/register
// @desc   Register new member with required photo (admin only)
// @access Private/Admin
router.post(
  "/register",
  protect,
  adminOnly,
  upload.single("image"), // ← Cloudinary upload
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Photo is required
    if (!req.file) {
      return res.status(400).json({ message: "সদস্যের ছবি আপলোড করা আবশ্যক" });
    }

    const { name, email, password, role, monthlyDonation } = req.body;
    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already registered" });

      const user = await User.create({
        name,
        email,
        password,
        role: role || "member",
        monthlyDonation: monthlyDonation || 0,
        image: req.file.path, // Cloudinary URL
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        monthlyDonation: user.monthlyDonation,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route  GET /api/auth/members
// @access Private
router.get("/members", protect, async (req, res) => {
  try {
    const members = await User.find({ isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  DELETE /api/auth/members/:id
// @access Private/Admin
router.delete("/members/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Member not found" });
    res.json({ message: "Member deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/auth/seed-admin
// @desc   Create first admin — DELETE THIS ROUTE after first use!
// @access Public
router.post("/seed-admin", async (req, res) => {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const admin = await User.create({
      name: "Admin",
      email: req.body.email || "admin@badaruddinwelfare.org",
      password: req.body.password || "Admin@123",
      role: "admin",
      image: "",
    });
    res.status(201).json({ message: "Admin created", email: admin.email });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
