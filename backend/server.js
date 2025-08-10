import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import { getAuthConn, getRoleConn } from "./db/connections.js"; // ensures connections init

const app = express();

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req,res)=>res.json({ ok:true, ts:new Date().toISOString() }));

app.use("*", (_req,res)=>res.status(404).json({ success:false, message:"Route not found" }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await getAuthConn().asPromise();       // wait for auth DB
    // coord/fac DBs will connect on demand too; they’re already initialized by import
    app.listen(PORT, ()=>console.log(`API on :${PORT}`));
  } catch (e) {
    console.error("Startup error:", e);
    process.exit(1);
  }
}
start();
