const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

// --- Config ---
// Use process.env to access variables, provide defaults if needed
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Validate Critical Config ---
if (!MONGO_URI || !JWT_SECRET) {
  console.error(
    "❌ MONGO_URI or JWT_SECRET is missing. Please define them in the .env file."
  );
  process.exit(1);
}

// --- Initialize App ---
const app = express();

// Example: Allow only your frontend domain
const corsOptions = {
  origin: "http://your-frontend-domain.com", // Or use environment variable
};
app.use(cors(corsOptions));

app.use(express.json());

// --- Routes ---
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// --- Connect to MongoDB ---
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true, // Note: This option might be deprecated depending on your Mongoose version
    // useUnifiedTopology: true // Often used together with useNewUrlParser, also potentially deprecated
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
