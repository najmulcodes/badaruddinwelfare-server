const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    attachment: { type: String, default: "" }, // Cloudinary URL
    status: {
      type: String,
      enum: ["New", "Under Review", "Approved", "Rejected"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpRequest", helpRequestSchema);
