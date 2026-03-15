const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  code:      { type: String, required: true },
  type:      { type: String, enum: ["register", "reset"], required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);