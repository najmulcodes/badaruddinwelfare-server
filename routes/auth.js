const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { protect, adminOnly } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../config/cloudinary");
const { sendOTPEmail } = require("../config/mailer");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SUPER_ADMIN = "admin@shariar.com";

// ── Upload middleware wrapper ──
const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(500).json({ message: "ছবি আপলোড ব্যর্থ হয়েছে", error: err.message });
    }
    next();
  });
};

// ── OTP Helpers ──
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const clearOldOTPs = (email, type) =>
  OTP.deleteMany({ email: email.toLowerCase(), type });

// ════════════════════════════════════════════════════
// OTP ROUTES
// ════════════════════════════════════════════════════

// POST /api/auth/send-register-otp
router.post("/send-register-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "ইমেইল প্রয়োজন" });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই নিবন্ধন হয়েছে" });

    // Rate limit — no more than 1 OTP per 60 seconds
    const recent = await OTP.findOne({
      email: email.toLowerCase(),
      type: "register",
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recent)
      return res.status(429).json({ message: "৬০ সেকেন্ড পর আবার চেষ্টা করুন" });

    await clearOldOTPs(email, "register");

    const code = generateOTP();
    await OTP.create({
      email: email.toLowerCase(),
      code,
      type: "register",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendOTPEmail(email, code, "register");
    res.json({ message: "OTP পাঠানো হয়েছে" });
  } catch (error) {
    console.error("❌ send-register-otp:", error.message);
    res.status(500).json({ message: "OTP পাঠাতে সমস্যা হয়েছে", error: error.message });
  }
});

// POST /api/auth/verify-register-otp
// Verifies OTP then creates the user account
router.post("/verify-register-otp", uploadSingle("image"), async (req, res) => {
  const { name, fatherName, email, phone, password, otp } = req.body;

  if (!name || !fatherName || !email || !phone || !password || !otp)
    return res.status(400).json({ message: "সকল তথ্য প্রয়োজন" });

  try {
    const record = await OTP.findOne({
      email: email.toLowerCase(),
      type: "register",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record)
      return res.status(400).json({ message: "OTP মেয়াদ শেষ বা পাওয়া যায়নি" });
    if (record.code !== otp.trim())
      return res.status(400).json({ message: "OTP সঠিক নয়" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই নিবন্ধন হয়েছে" });

    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    await User.create({
      name,
      fatherName,
      email: email.toLowerCase(),
      phone,
      password,
      image: imageUrl,
      role: "member",
      isActive: false,
    });

    // Mark OTP as used
    record.used = true;
    await record.save();

    res.status(201).json({
      message: "নিবন্ধন সফল! অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।",
    });
  } catch (error) {
    console.error("❌ verify-register-otp:", error.message);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "ইমেইল প্রয়োজন" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user)
      return res.json({ message: "যদি ইমেইলটি নিবন্ধিত থাকে, OTP পাঠানো হবে" });

    // Rate limit
    const recent = await OTP.findOne({
      email: email.toLowerCase(),
      type: "reset",
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recent)
      return res.status(429).json({ message: "৬০ সেকেন্ড পর আবার চেষ্টা করুন" });

    await clearOldOTPs(email, "reset");

    const code = generateOTP();
    await OTP.create({
      email: email.toLowerCase(),
      code,
      type: "reset",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTPEmail(email, code, "reset");
    res.json({ message: "OTP পাঠানো হয়েছে" });
  } catch (error) {
    console.error("❌ forgot-password:", error.message);
    res.status(500).json({ message: "OTP পাঠাতে সমস্যা হয়েছে", error: error.message });
  }
});

// POST /api/auth/verify-reset-otp
// Validates OTP without consuming it (frontend gate before password form)
router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "ইমেইল ও OTP প্রয়োজন" });

  try {
    const record = await OTP.findOne({
      email: email.toLowerCase(),
      type: "reset",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record || record.code !== otp.trim())
      return res.status(400).json({ message: "OTP সঠিক নয় বা মেয়াদ শেষ" });

    res.json({ message: "OTP সঠিক" });
  } catch (error) {
    console.error("❌ verify-reset-otp:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "সকল তথ্য প্রয়োজন" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" });

  try {
    const record = await OTP.findOne({
      email: email.toLowerCase(),
      type: "reset",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record || record.code !== otp.trim())
      return res.status(400).json({ message: "OTP সঠিক নয় বা মেয়াদ শেষ" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি" });

    // Assign plain password — pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    // Consume OTP
    record.used = true;
    await record.save();

    res.json({ message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে" });
  } catch (error) {
    console.error("❌ reset-password:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════

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
      return res.status(403).json({
        message: "অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });

    res.json({
      _id:             user._id,
      name:            user.name,
      fatherName:      user.fatherName,
      email:           user.email,
      phone:           user.phone,
      role:            user.role,
      image:           user.image,
      monthlyDonation: user.monthlyDonation,
      token:           generateToken(user._id),
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
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: googleId + process.env.JWT_SECRET,
        image:    picture || "",
        googleId,
        role:     "member",
        isActive: false,
      });
      return res.status(403).json({
        message: "নিবন্ধন সফল! অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।",
      });
    }

    if (!user.isActive)
      return res.status(403).json({
        message: "অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });

    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.image && picture) user.image = picture;
      await user.save();
    }

    res.json({
      _id:             user._id,
      name:            user.name,
      fatherName:      user.fatherName,
      email:           user.email,
      phone:           user.phone,
      role:            user.role,
      image:           user.image,
      monthlyDonation: user.monthlyDonation,
      token:           generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Google login error:", error.message);
    res.status(401).json({ message: "Google লগইন যাচাই করা যায়নি" });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => res.json(req.user));

// POST /api/auth/register-request (public — kept for backward compat, no OTP)
router.post("/register-request", uploadSingle("image"), async (req, res) => {
  const { name, fatherName, email, phone, password } = req.body;
  if (!name || !fatherName || !email || !phone || !password)
    return res.status(400).json({ message: "সকল তথ্য পূরণ করুন" });
  if (password.length < 6)
    return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" });

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই নিবন্ধন হয়েছে" });

    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    await User.create({
      name, fatherName, email, phone, password,
      image:    imageUrl,
      role:     "member",
      isActive: false,
    });

    res.status(201).json({
      message: "নিবন্ধন সফল! অ্যাডমিন অনুমোদনের পর লগইন করতে পারবেন।",
    });
  } catch (error) {
    console.error("❌ Register-request error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/register (admin only — direct add with isActive: true)
router.post("/register", protect, adminOnly, uploadSingle("image"), async (req, res) => {
  const { name, fatherName, email, phone, password, role, monthlyDonation } = req.body;

  if (!name)                        return res.status(400).json({ message: "Name required" });
  if (!email)                       return res.status(400).json({ message: "Valid email required" });
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be 6+ chars" });
  if (!req.file)                    return res.status(400).json({ message: "সদস্যের ছবি আপলোড করা আবশ্যক" });

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const result = await uploadToCloudinary(req.file.buffer);
    const user   = await User.create({
      name, fatherName, email, phone, password,
      role:            role || "member",
      monthlyDonation: monthlyDonation || 0,
      image:           result.secure_url,
      isActive:        true,
    });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      image: user.image,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    console.error("❌ Stack:", error.stack);
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
    if (password)   user.password   = password;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      user.image = result.secure_url;
    }

    await user.save();

    res.json({
      _id:             user._id,
      name:            user.name,
      fatherName:      user.fatherName,
      email:           user.email,
      phone:           user.phone,
      role:            user.role,
      image:           user.image,
      monthlyDonation: user.monthlyDonation,
    });
  } catch (error) {
    console.error("❌ Update-profile error:", error.message);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/auth/members
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

// GET /api/auth/pending
router.get("/pending", protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ isActive: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/auth/approve/:id
router.patch("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Member not found" });
    res.json({ message: `${user.name} অনুমোদন হয়েছে`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/auth/members/:id  (deactivate)
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

// DELETE /api/auth/reject/:id  (delete pending)
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