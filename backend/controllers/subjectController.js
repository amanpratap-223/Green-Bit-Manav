// backend/controllers/subjectController.js
import Subject from "../models/Subject.js";
import User from "../models/User.js";

/** Create subject */
export const createSubject = async (req, res) => {
  try {
    const { name, code, semester } = req.body;
    if (!name || !code || !semester) {
      return res
        .status(400)
        .json({ success: false, message: "Name, code, and semester are required" });
    }

    const subject = new Subject({
      name: name.trim(),
      code: code.trim(),
      semester: semester.trim(),
      coordinator: req.user.id,
      components: [], // start empty; UI can add
    });

    const saved = await subject.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Subject code already exists" });
    }
    console.error("Create subject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** List subjects for current user (coordinator or assigned faculty) */
export const getSubjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "faculty") {
      query["facultyAssignments.faculty"] = req.user.id;
    } else if (req.user.role === "coordinator") {
      query.coordinator = req.user.id;
    }

    const subjects = await Subject.find(query)
      .populate("coordinator", "name email")
      .populate("facultyAssignments.faculty", "name email");

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error("Get subjects error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Generic update (coordinator only) */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    Object.assign(subject, req.body);
    const updated = await subject.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update subject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** --- Course Objectives --- */
export const addCourseObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const { objective } = req.body;

    if (!objective?.trim()) {
      return res.status(400).json({ success: false, message: "Objective is required" });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: id, coordinator: req.user.id },
      { $push: { courseObjectives: objective.trim() } },
      { new: true }
    );

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    res.json({ success: true, data: subject });
  } catch (err) {
    console.error("Add course objective error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** --- Dynamic Components (MST/EST/etc.) --- */
// Upsert (add or update) a component by name
export const upsertComponent = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, maxMarks, enabled = true } = req.body;

    name = String(name || "").trim();
    maxMarks = Number(maxMarks);

    if (!name || Number.isNaN(maxMarks) || maxMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "name and non-negative maxMarks are required",
      });
    }

    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    const idx = (subject.components || []).findIndex(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (idx >= 0) {
      subject.components[idx].maxMarks = maxMarks;
      subject.components[idx].enabled = enabled;
    } else {
      subject.components.push({ name, maxMarks, enabled });
    }

    const saved = await subject.save();
    res.json({ success: true, data: saved.components });
  } catch (err) {
    console.error("Upsert component error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove a component by name
export const removeComponent = async (req, res) => {
  try {
    const { id, name } = req.params;

    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    subject.components = (subject.components || []).filter(
      (c) => c.name.toLowerCase() !== String(name || "").toLowerCase()
    );

    const saved = await subject.save();
    res.json({ success: true, data: saved.components });
  } catch (err) {
    console.error("Remove component error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** --- Faculty assignment helpers (unchanged) --- */
export const assignFacultyToSubject = async (req, res) => {
  try {
    const { id } = req.params; // subject id
    const { facultyId, subgroup } = req.body;

    if (!facultyId || !subgroup) {
      return res
        .status(400)
        .json({ success: false, message: "Faculty ID and subgroup are required" });
    }

    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });
    if (!faculty) {
      return res.status(400).json({ success: false, message: "Invalid faculty member" });
    }

    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    const exists = subject.facultyAssignments.find(
      (a) => a.faculty.toString() === facultyId && a.subgroup === subgroup
    );
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "This faculty is already assigned to this subgroup" });
    }

    subject.facultyAssignments.push({ faculty: facultyId, subgroup });
    await subject.save();
    await subject.populate("facultyAssignments.faculty", "name email");

    res.json({ success: true, data: subject });
  } catch (err) {
    console.error("Assign faculty error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFacultyAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({
      _id: id,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    }).populate("facultyAssignments.faculty", "name email");

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    res.json({ success: true, data: subject.facultyAssignments });
  } catch (err) {
    console.error("Get faculty assignments error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFacultyAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found or unauthorized" });
    }

    subject.facultyAssignments = subject.facultyAssignments.filter(
      (a) => a._id.toString() !== assignmentId
    );
    await subject.save();
    await subject.populate("facultyAssignments.faculty", "name email");

    res.json({ success: true, data: subject });
  } catch (err) {
    console.error("Remove faculty assignment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" }, "name email");
    res.json({ success: true, data: faculty });
  } catch (err) {
    console.error("Get faculty list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
