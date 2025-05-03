const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Config ---
const PORT = 5001;
const MONGO_URI =
  "mongodb+srv://nithinithish271:nithish1230@cluster0.cbw99.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET =
  "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e";

// --- Validate Critical Config ---
if (!MONGO_URI || !JWT_SECRET) {
  console.error(
    "❌ MONGO_URI or JWT_SECRET is missing. Please define them in the code."
  );
  process.exit(1);
}

// --- Initialize App ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Routes ---
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// --- Connect to MongoDB ---
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    // --- Start Server only after DB is connected ---
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 TIP: Make sure your IP is whitelisted in MongoDB Atlas.");
    process.exit(1);
  });
