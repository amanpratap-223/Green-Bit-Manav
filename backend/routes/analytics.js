import express from "express";
import { calculateCOAnalytics } from "../controllers/analyticsController.js";
const router = express.Router();

router.post("/calculate", calculateCOAnalytics);

export default router;
