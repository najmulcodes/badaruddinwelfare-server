const express = require("express");
const router = express.Router();
const NewsPost = require("../models/NewsPost");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(500).json({ message: "ছবি আপলোড ব্যর্থ হয়েছে", error: err.message });
    }
    next();
  });
};

router.get("/", async (req, res) => {
  try {
    const posts = await NewsPost.find().populate("addedBy", "name").sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/", protect, adminOnly, uploadSingle("image"), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });
    const post = await NewsPost.create({
      title, description,
      date: date || Date.now(),
      image: req.file?.path || "",
      addedBy: req.user._id,
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("❌ News post error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const post = await NewsPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;