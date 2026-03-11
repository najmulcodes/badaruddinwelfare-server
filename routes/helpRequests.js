const express = require("express");
const router = express.Router();
const HelpRequest = require("../models/HelpRequest");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// @route  POST /api/help-requests
// @desc   Submit a help request (public)
// @access Public
router.post("/", upload.single("attachment"), async (req, res) => {
  try {
    const { fullName, phone, address, description } = req.body;
    if (!fullName || !phone || !address || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const helpRequest = await HelpRequest.create({
      fullName,
      phone,
      address,
      description,
      attachment: req.file?.path || "",
    });
    res.status(201).json({ message: "Help request submitted successfully", helpRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/help-requests
// @desc   Get all help requests
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await HelpRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/help-requests/:id/status
// @desc   Update help request status
// @access Private
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["New", "Under Review", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  DELETE /api/help-requests/:id
// @desc   Delete a help request
// @access Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const request = await HelpRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
