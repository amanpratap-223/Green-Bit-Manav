// backend/routes/subjects.js
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
  getFacultyList,
  upsertComponent,
  removeComponent,
} from "../controllers/subjectController.js";

const router = express.Router();

router.use(auth);

router.post("/", createSubject);
router.get("/", getSubjects);
router.put("/:id", updateSubject);

// Course Objectives
router.post("/:id/objectives", addCourseObjective);

// Dynamic Components
router.post("/:id/components", upsertComponent);        // body: { name, maxMarks, enabled? }
router.delete("/:id/components/:name", removeComponent);

// Faculty assignment
router.post("/:id/assign-faculty", assignFacultyToSubject);
router.get("/:id/faculty-assignments", getFacultyAssignments);
router.delete("/:id/faculty-assignments/:assignmentId", removeFacultyAssignment);

// Faculty list
router.get("/faculty-list", getFacultyList);

export default router;
