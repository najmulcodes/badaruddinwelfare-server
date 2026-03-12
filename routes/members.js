const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Donation = require("../models/Donation");

// GET /api/members/active — public
// Returns members who donated in the current month
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Find member IDs who donated this month
    const donations = await Donation.find({
      month: currentMonth,
      year: currentYear,
    }).distinct("member");

    // Get those members
    const activeMembers = await User.find({
      _id: { $in: donations },
      isActive: true,
      role: "member",
    })
      .select("name image")
      .limit(20);

    res.json(activeMembers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/members — all active members (private, already in auth routes)
// This route is public-facing only for the about page active list

module.exports = router;
