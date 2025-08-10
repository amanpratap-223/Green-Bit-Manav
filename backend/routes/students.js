import express from "express";
import auth from "../middleware/auth.js";
import { getAllStudents, addOrUpdateStudent } from "../controllers/studentController.js";
const router = express.Router();
router.get("/", auth, getAllStudents);
router.post("/", auth, addOrUpdateStudent);
export default router;