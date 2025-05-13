// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
    console.error("❌ MONGO_URI or JWT_SECRET missing!");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Auth Service is Live!");
});

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Auth running at http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1);
    });
