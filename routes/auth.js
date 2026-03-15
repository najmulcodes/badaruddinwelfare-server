const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SUPER_ADMIN = "admin@shariar.com";

const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(500).json({ message: "ছবি আপলোড ব্যর্থ হয়েছে", error: err.message });
    }
    next();
  });
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
    if (!user.isActive)
      return res.status(403).json({ message: "অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।" });
    res.json({
      _id: user._id, name: user.name, fatherName: user.fatherName,
      email: user.email, phone: user.phone, role: user.role,
      image: user.image, monthlyDonation: user.monthlyDonation,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/google-login
router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Google token required" });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken, audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name, email,
        password: googleId + process.env.JWT_SECRET,
        image: picture || "", googleId, role: "member", isActive: false,
      });
      return res.status(403).json({ message: "নিবন্ধন সফল! অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।" });
    }
    if (!user.isActive)
      return res.status(403).json({ message: "অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।" });
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.image && picture) user.image = picture;
      await user.save();
    }
    res.json({
      _id: user._id, name: user.name, fatherName: user.fatherName,
      email: user.email, phone: user.phone, role: user.role,
      image: user.image, monthlyDonation: user.monthlyDonation,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Google login error:", error.message);
    res.status(401).json({ message: "Google লগইন যাচাই করা যায়নি" });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => res.json(req.user));

// POST /api/auth/register-request (public)
router.post("/register-request", uploadSingle("image"), async (req, res) => {
  const { name, fatherName, email, phone, password } = req.body;
  if (!name || !fatherName || !email || !phone || !password)
    return res.status(400).json({ message: "সকল তথ্য পূরণ করুন" });
  if (!req.file)
    return res.status(400).json({ message: "প্রোফাইল ছবি আপলোড করা আবশ্যক" });
  if (password.length < 6)
    return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই নিবন্ধন হয়েছে" });
    await User.create({
      name, fatherName, email, phone, password,
      image: req.file.path, role: "member", isActive: false,
    });
    res.status(201).json({ message: "নিবন্ধন সফল! অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।" });
  } catch (error) {
    console.error("❌ Register-request error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/register (admin only)
router.post("/register", protect, adminOnly, uploadSingle("image"), async (req, res) => {
  const { name, fatherName, email, phone, password, role, monthlyDonation } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  if (!email) return res.status(400).json({ message: "Valid email required" });
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be 6+ chars" });
  if (!req.file) return res.status(400).json({ message: "সদস্যের ছবি আপলোড করা আবশ্যক" });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({
      name, fatherName, email, phone, password,
      role: role || "member",
      monthlyDonation: monthlyDonation || 0,
      image: req.file.path,
      isActive: true,
    });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, image: user.image, token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/auth/update-profile
router.put("/update-profile", protect, uploadSingle("image"), async (req, res) => {
  try {
    const { name, fatherName, email, phone, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name)       user.name       = name;
    if (fatherName) user.fatherName = fatherName;
    if (email)      user.email      = email;
    if (phone)      user.phone      = phone;
    if (req.file)   user.image      = req.file.path;
    if (password)   user.password   = password;
    await user.save();
    res.json({
      _id: user._id, name: user.name, fatherName: user.fatherName,
      email: user.email, phone: user.phone, role: user.role,
      image: user.image, monthlyDonation: user.monthlyDonation,
    });
  } catch (error) {
    console.error("❌ Update-profile error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/auth/members
router.get("/members", protect, async (req, res) => {
  try {
    const members = await User.find({ isActive: true }).select("-password").sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/auth/pending
router.get("/pending", protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ isActive: false }).select("-password").sort({ createdAt: -1 });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/auth/approve/:id
router.patch("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "Member not found" });
    res.json({ message: `${user.name} অনুমোদন হয়েছে`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/auth/members/:id
router.delete("/members/:id", protect, adminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Member not found" });
    if (target.email === SUPER_ADMIN)
      return res.status(403).json({ message: "এই অ্যাকাউন্টে কোনো পরিবর্তন করা যাবে না" });
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Member deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/auth/reject/:id
router.delete("/reject/:id", protect, adminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Member not found" });
    if (target.email === SUPER_ADMIN)
      return res.status(403).json({ message: "এই অ্যাকাউন্টে কোনো পরিবর্তন করা যাবে না" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "আবেদন বাতিল করা হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;