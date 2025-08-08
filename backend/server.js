import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import studentRoutes from "./routes/students.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : ['http://localhost:3000', 'http://localhost:5173'], // Fixed: Added Vite's port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10kb' }));

// MongoDB Connection - FIXED: Removed deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection route (for debugging)
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    res.json({
      success: true,
      message: 'Database connected',
      userCount: userCount,
      dbName: mongoose.connection.db.databaseName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
