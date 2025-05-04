const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load .env file

// ------------------
// Config
// ------------------
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ------------------
// Validate Critical Vars
// ------------------
if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ MONGO_URI or JWT_SECRET is missing in environment.");
  process.exit(1);
}

// ------------------
// Initialize Express App
// ------------------
const app = express();

// Middleware
app.use(cors({
  origin: '*',  // Allows requests from any origin
  credentials: true,  // Include credentials like cookies or HTTP authentication if needed
}));
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// ------------------
// MongoDB Connection
// ------------------
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
