// backend/routes/facultyRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import { getFacultyRoster, uploadFacultyMarks } from "../controllers/facultyController.js";

const router = express.Router();

router.use(auth);

router.get("/subject/:subjectId/roster", getFacultyRoster);
router.post("/subject/:subjectId/upload-marks", uploadFacultyMarks);

export default router;
