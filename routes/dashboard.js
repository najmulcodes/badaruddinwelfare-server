const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Spending = require("../models/Spending");
const HelpRequest = require("../models/HelpRequest");
const ContactMessage = require("../models/ContactMessage");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// @route  GET /api/dashboard
// @desc   Get all summary data for the member dashboard
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    // Total donations
    const donationResult = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalDonations = donationResult[0]?.total || 0;

    // Total spending
    const spendingResult = await Spending.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSpending = spendingResult[0]?.total || 0;

    // Available fund
    const availableFund = totalDonations - totalSpending;

    // Counts
    const totalMembers = await User.countDocuments({ isActive: true });
    const newHelpRequests = await HelpRequest.countDocuments({ status: "New" });
    const unreadMessages = await ContactMessage.countDocuments({ isRead: false });

    // Recent activity (last 5 donations + last 5 spendings)
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("member", "name");

    const recentSpendings = await Spending.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalDonations,
      totalSpending,
      availableFund,
      totalMembers,
      newHelpRequests,
      unreadMessages,
      recentDonations,
      recentSpendings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
