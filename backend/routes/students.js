import express from "express";
import auth from "../middleware/auth.js";
import {
  uploadStudents,
  getStudentsBySubject,
  getSubjectAnalytics,
  bulkUpsertMarks, // <-- add this
} from "../controllers/studentController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/upload", uploadStudents);
router.get("/subject/:subjectId", getStudentsBySubject);
router.get("/analytics/:subjectId", getSubjectAnalytics);

// Faculty marks entry (bulk upsert)
router.put("/subject/:subjectId/marks", bulkUpsertMarks); // <-- add this

export default router;
