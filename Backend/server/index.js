// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// ------------------
// Configuration
// ------------------
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/appdb";
const JWT_SECRET = process.env.JWT_SECRET;

// Validate critical environment variables
if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ MONGO_URI or JWT_SECRET is missing. Please define them in the .env file or pass via environment.");
  process.exit(1);
}

// ------------------
// Initialize Express App
// ------------------
const app = express();

// ------------------
// Middleware
// ------------------
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*", // Set specific origin in production
}));
app.use(express.json());

// ------------------
// Routes
// ------------------
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Sample root endpoint (optional)
app.get("/", (req, res) => {
  res.send("✅ Server is up and running.");
});

// ------------------
// MongoDB Connection
// ------------------
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 TIP: If you're using MongoDB Atlas, ensure your cluster IP is whitelisted and the URI is correct.");
    process.exit(1);
  });
