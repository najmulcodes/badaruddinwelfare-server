const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log("🔄 Retrying in 5 seconds...");
    setTimeout(connectDB, 5000); // retry instead of crashing
  }
};

module.exports = connectDB;