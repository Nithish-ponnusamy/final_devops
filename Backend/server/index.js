const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT =5004;
const MONGO_URI = 'mongodb://localhost:27017/full_stack';
const JWT_SECRET='4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e'
// Check if JWT_SECRET is loaded
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set. Please add it to your .env file.");
    process.exit(1); // Exit the application if JWT_SECRET is missing
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
