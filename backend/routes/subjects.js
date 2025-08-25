import express from "express";
import auth from "../middleware/auth.js";
import {
  createSubject,
  getSubjects,
  updateSubject,
  addCourseObjective,
  getComponents,
  saveComponents,
  assignFacultyToSubject,
  getFacultyAssignments,
  removeFacultyAssignment,
  getFacultyList,
} from "../controllers/subjectController.js";

const router = express.Router();
router.use(auth);

// CRUD
router.post("/", createSubject);
router.get("/", getSubjects);
router.put("/:id", updateSubject);

// Course Objectives
router.post("/:id/objectives", addCourseObjective);

// Components
router.get("/:id/components", getComponents);
router.post("/:id/components", saveComponents);

// Faculty assignments
router.post("/:id/assign-faculty", assignFacultyToSubject);
router.get("/:id/faculty-assignments", getFacultyAssignments);
router.delete("/:id/faculty-assignments/:assignmentId", removeFacultyAssignment);

// List of all faculty
router.get("/faculty-list", getFacultyList);

export default router;
