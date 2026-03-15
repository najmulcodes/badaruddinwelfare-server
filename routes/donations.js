const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const { protect, adminOnly } = require("../middleware/auth");

// @route  GET /api/donations
// @desc   Get all donations (with optional filters)
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const { member, month, year, status } = req.query;
    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";
    const filter = {};

    if (member) {
      if (!isAdmin && String(member) !== String(req.user._id)) {
        return res.status(403).json({ message: "এই তথ্য দেখার অনুমতি নেই" });
      }
      filter.member = member;
    }

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (isAdmin) {
      if (status) filter.status = status;
    } else if (!filter.member) {
      filter.status = "approved";
    }

    const donations = await Donation.find(filter)
      .populate("member", "name email image")
      .sort({ date: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/donations/summary
// @desc   Get total donations amount
// @access Private
router.get("/summary", protect, async (req, res) => {
  try {
    const result = await Donation.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ totalDonations: result[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/donations/member-report
// @desc   Logged-in member submits donation info
// @access Private
router.post("/member-report", protect, async (req, res) => {
  try {
    const { amount, month, year, notes } = req.body;
    if (!amount || !month || !year) {
      return res.status(400).json({ message: "Amount, month and year are required" });
    }

    const donation = await Donation.create({
      member: req.user._id,
      memberName: req.user.name,
      amount,
      month: Number(month),
      year: Number(year),
      notes: notes || "Member self-report",
      status: "pending",
    });

    res.status(201).json({
      message: "Donation report submitted successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/donations
// @desc   Add donation entry
// @access Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { member, memberName, amount, month, year, notes } = req.body;
    if (!member || !memberName || !amount || !month || !year) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    const donation = await Donation.create({
      member,
      memberName,
      amount,
      month,
      year,
      notes,
      status: "approved",
    });
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/donations/approve/:id
// @desc   Approve a pending donation
// @access Private/Admin
router.patch("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation approved", donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/donations/reject/:id
// @desc   Reject a pending donation
// @access Private/Admin
router.patch("/reject/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation rejected", donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  DELETE /api/donations/:id
// @desc   Delete a donation entry
// @access Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
