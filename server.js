const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "https://badaruddinwelfare-client.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/donations",     require("./routes/donations"));
app.use("/api/spending",      require("./routes/spending"));
app.use("/api/help-requests", require("./routes/helpRequests"));
app.use("/api/contact",       require("./routes/contact"));
app.use("/api/news",          require("./routes/news"));
app.use("/api/dashboard",     require("./routes/dashboard"));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "✅ Badaruddin Welfare API is running", status: "OK" });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
