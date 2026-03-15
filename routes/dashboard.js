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
    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";

    // Total donations
    const donationResult = await Donation.aggregate([
      { $match: { status: "approved" } },
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
    const pendingDonations = isAdmin
      ? await Donation.countDocuments({ status: "pending" })
      : 0;

    // Recent activity (last 5 donations + last 5 spendings)
    const recentDonations = await Donation.find({ status: "approved" })
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
      pendingDonations,
      recentDonations,
      recentSpendings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/dashboard/analytics
// @desc   Get donation analytics summary
// @access Private
router.get("/analytics", protect, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [donationResult, donationCount, currentMonthResult, totalMembers, pendingHelpRequests] =
      await Promise.all([
        Donation.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Donation.countDocuments({ status: "approved" }),
        Donation.aggregate([
          { $match: { status: "approved", month: currentMonth, year: currentYear } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        User.countDocuments({ isActive: true }),
        HelpRequest.countDocuments({ status: "New" }),
      ]);

    res.json({
      totalDonations: donationResult[0]?.total || 0,
      donationCount,
      currentMonthDonations: currentMonthResult[0]?.total || 0,
      totalMembers,
      pendingHelpRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
