const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate .env
if (!MONGO_URI || !JWT_SECRET) {
    console.error("❌ Missing environment variables");
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("🚀 Auth Server Running!");
});

// MongoDB connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Auth Server on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });
