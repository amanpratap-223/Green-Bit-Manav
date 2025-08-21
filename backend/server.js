// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";

// import connectDB from "./db/connections.js";
// import authRoutes from "./routes/auth.js";
// // You will create and import these routes next
// // import studentRoutes from "./routes/student.js"; 
// // import analyticsRoutes from "./routes/analytics.js";

// // Connect to Database
// connectDB();

// const app = express();

// app.use(helmet());
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:3000"],
//   credentials: true
// }));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
// app.use(express.json());

// // Define Routes
// app.use("/api/auth", authRoutes);
// // app.use("/api/students", studentRoutes);
// // app.use("/api/analytics", analyticsRoutes);

// app.get("/api/health", (_req,res)=>res.json({ ok:true, ts:new Date().toISOString() }));

// app.use("*", (_req,res)=>res.status(404).json({ success:false, message:"Route not found" }));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`API on :${PORT}`));



// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./db/connections.js";
import authRoutes from "./routes/auth.js";

const app = express();

// security & body parsing
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// health
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// 404
app.use("*", (_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// start
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();           // ⬅️ ensure DB is connected first
  app.listen(PORT, () =>
    console.log(`✅ API on http://localhost:${PORT}`)
  );
}
start();
