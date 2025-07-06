import express from "express";
import { getAllStudents, addOrUpdateStudent } from "../controllers/studentController.js";
const router = express.Router();

router.get("/", getAllStudents);
router.post("/", addOrUpdateStudent);

export default router;
