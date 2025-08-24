import express from "express";
import auth from "../middleware/auth.js";
import {
  createSubject,
  getSubjects,
  updateSubject,
  addCourseObjective,
  assignFacultyToSubject,
  getFacultyAssignments,
  removeFacultyAssignment,
  getFacultyList
} from "../controllers/subjectController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/", createSubject);
router.get("/", getSubjects);
router.put("/:id", updateSubject);
router.post("/:id/objectives", addCourseObjective);

// Faculty assignment routes
router.post("/:id/assign-faculty", assignFacultyToSubject);
router.get("/:id/faculty-assignments", getFacultyAssignments);
router.delete("/:id/faculty-assignments/:assignmentId", removeFacultyAssignment);

// Get faculty list
router.get("/faculty-list", getFacultyList);

export default router;
