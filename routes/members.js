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

// GET /api/members/top — public
// Returns top contributors of all time, sorted by total donation amount
router.get("/top", async (req, res) => {
  try {
    const topDonors = await Donation.aggregate([
      { $group: { _id: "$member", totalAmount: { $sum: "$amount" } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 20 },
    ]);

    const memberIds = topDonors.map((d) => d._id);
    const users = await User.find({
      _id: { $in: memberIds },
      isActive: true,
      role: "member",
    }).select("name image");

    // Merge totalAmount into each user object
    const result = users.map((u) => {
      const donor = topDonors.find((d) => d._id.toString() === u._id.toString());
      return { ...u.toObject(), totalAmount: donor ? donor.totalAmount : 0 };
    });

    // Re-sort by totalAmount descending (since User.find doesn't preserve order)
    result.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/members — public
// Returns all active members
router.get("/", async (req, res) => {
  try {
    const allMembers = await User.find({ isActive: true, role: "member" })
      .select("name image")
      .sort({ name: 1 });

    res.json(allMembers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;