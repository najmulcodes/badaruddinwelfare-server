const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ── Logging Middleware ──────────────────────────────────────
app.use(morgan("dev"));

// ── CORS Configuration ──────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://badaruddinwelfare-client.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/spending", require("./routes/spending"));
app.use("/api/help-requests", require("./routes/helpRequests"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/news", require("./routes/news"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/members", require("./routes/members"));

// ── Health Check Route ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "✅ Badaruddin Welfare API is running",
    status: "OK",
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 API URL: http://localhost:${PORT}`);
});