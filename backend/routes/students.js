import express from "express";
import auth from "../middleware/auth.js";
import {
  uploadStudents,
  getStudentsBySubject,
  getSubjectAnalytics
} from "../controllers/studentController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/upload", uploadStudents);
router.get("/subject/:subjectId", getStudentsBySubject);
router.get("/analytics/:subjectId", getSubjectAnalytics);

export default router;
