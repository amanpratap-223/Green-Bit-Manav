import express from "express";
import { 
  createSubject, 
  getSubjects, 
  updateSubject, 
  deleteSubject,
  addCourseObjective,
  getComponents,
  saveComponents,
  assignFacultyToSubject,
  getFacultyAssignments,
  removeFacultyAssignment,
  getFacultyList,
  // 🔥 NEW: CO Matrix endpoints
  getCourseOutcomes,
  saveCourseOutcomes,
  calculateCOMatrix,
  validateMarksUploaded
} from "../controllers/subjectController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create a role checking middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};

// Subject CRUD
router.post("/", auth, requireRole(["coordinator"]), createSubject);
router.get("/", auth, getSubjects);
router.put("/:id", auth, requireRole(["coordinator"]), updateSubject);
router.delete("/:id", auth, requireRole(["coordinator"]), deleteSubject);

// Course objectives
router.post("/:id/objectives", auth, requireRole(["coordinator"]), addCourseObjective);

// Components
router.get("/:id/components", auth, getComponents);
router.post("/:id/components", auth, requireRole(["coordinator"]), saveComponents);

// Faculty assignments
router.post("/:id/assign-faculty", auth, requireRole(["coordinator"]), assignFacultyToSubject);
router.get("/:id/faculty-assignments", auth, getFacultyAssignments);
router.delete("/:id/assignments/:assignmentId", auth, requireRole(["coordinator"]), removeFacultyAssignment);

// Faculty list
router.get("/faculty-list", auth, getFacultyList);

// 🔥 NEW: CO Matrix routes
router.get("/:id/course-outcomes", auth, getCourseOutcomes);
router.post("/:id/course-outcomes", auth, requireRole(["coordinator"]), saveCourseOutcomes);
router.get("/:id/co-matrix/calculate", auth, calculateCOMatrix);
router.get("/:id/co-matrix/validate-marks", auth, validateMarksUploaded);

export default router;
