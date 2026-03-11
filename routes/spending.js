const express = require("express");
const router = express.Router();
const Spending = require("../models/Spending");
const { protect, adminOnly } = require("../middleware/auth");

// @route  GET /api/spending
// @desc   Get all spending records
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const spendings = await Spending.find()
      .populate("addedBy", "name")
      .sort({ date: -1 });
    res.json(spendings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/spending/summary
// @desc   Get total spending amount
// @access Private
router.get("/summary", protect, async (req, res) => {
  try {
    const result = await Spending.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ totalSpending: result[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/spending
// @desc   Add spending entry
// @access Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { recipientName, amount, purpose, date, notes } = req.body;
    if (!recipientName || !amount || !purpose) {
      return res.status(400).json({ message: "recipientName, amount and purpose are required" });
    }
    const spending = await Spending.create({
      recipientName,
      amount,
      purpose,
      date: date || Date.now(),
      notes,
      addedBy: req.user._id,
    });
    res.status(201).json(spending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  DELETE /api/spending/:id
// @desc   Delete a spending entry
// @access Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const spending = await Spending.findByIdAndDelete(req.params.id);
    if (!spending) return res.status(404).json({ message: "Spending record not found" });
    res.json({ message: "Spending record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
