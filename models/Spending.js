const mongoose = require("mongoose");

const spendingSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    purpose: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Spending", spendingSchema);
