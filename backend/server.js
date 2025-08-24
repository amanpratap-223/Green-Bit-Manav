import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./db/connections.js";
import authRoutes from "./routes/auth.js";
import subjectRoutes from "./routes/subjects.js";
import studentRoutes from "./routes/students.js";

const app = express();

// Security & body parsing
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb' })); // Increased limit for Excel uploads

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// 404 handler
app.use("*", (_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// Start server
const PORT = process.env.PORT || 5000;
async function start() {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`✅ API on http://localhost:${PORT}`)
  );
}

start();
