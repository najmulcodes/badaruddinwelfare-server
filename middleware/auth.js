const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect — verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "অনুমোদিত নয়। লগইন করুন।" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "ব্যবহারকারী পাওয়া যায়নি" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "টোকেন অবৈধ বা মেয়াদ শেষ" });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "শুধুমাত্র অ্যাডমিনের অনুমতি আছে" });
  }
};

module.exports = { protect, adminOnly };
