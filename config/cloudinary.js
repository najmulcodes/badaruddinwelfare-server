const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Verify Cloudinary connection on startup ──
cloudinary.api.ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((err) => console.error("❌ Cloudinary Error:", err.message));

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "badaruddin-welfare",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, upload };