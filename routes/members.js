const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Donation = require("../models/Donation");

// GET /api/members/all — public, all approved members with photo + name
router.get("/all", async (req, res) => {
  try {
    const members = await User.find({ isActive: true, role: "member" })
      .select("name image")
      .sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/members/active — public, members who donated this month
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const donations = await Donation.find({
      month: currentMonth,
      year: currentYear,
    }).distinct("member");

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

module.exports = router;
