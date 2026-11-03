const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, ".env")
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to LostLink Backend API!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LostLink backend is running successfully!"
  });
});

// Authentication routes
const authRoutes = require("./routes/authRoutes.cjs");
app.use("/api/auth", authRoutes);

// Lost and Found Item routes
const itemRoutes = require("./routes/itemRoutes.cjs");
app.use("/api/items", itemRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in server/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`LostLink Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Backend Startup Error:", error.message);
    process.exit(1);
  }
}

startServer();