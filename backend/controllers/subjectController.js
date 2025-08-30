import Subject from "../models/Subject.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

/** CREATE */
export const createSubject = async (req, res) => {
  try {
    const { name, code, semester } = req.body;
    if (!name || !code || !semester) {
      return res.status(400).json({ success: false, message: "Name, code and semester are required" });
    }
    const subject = new Subject({
      name: name.trim(),
      code: code.trim(),
      semester: semester.trim(),
      coordinator: req.user.id,
      components: [],
    });
    const saved = await subject.save();
    res.status(201).json({ success: true, data: saved });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: "Subject code already exists" });
    }
    console.error("createSubject:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE SUBJECT (coordinator only) */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for subject ID:', id);
    console.log('User requesting delete:', req.user);
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid subject ID format" });
    }
    
    // Find subject first
    const subject = await Subject.findById(id);
    console.log('Found subject:', subject);
    
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    
    // Check if user is the coordinator of this subject
    if (subject.coordinator.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete subjects you coordinate" });
    }

    // Delete all students associated with this subject
    const studentDeleteResult = await Student.deleteMany({ subject: id });
    console.log(`Deleted ${studentDeleteResult.deletedCount} students`);
    
    // Delete the subject
    await Subject.findByIdAndDelete(id);
    console.log('Subject deleted successfully');
    
    res.json({ 
      success: true, 
      message: `Subject and ${studentDeleteResult.deletedCount} associated students deleted successfully` 
    });
  } catch (e) {
    console.error("deleteSubject error:", e);
    res.status(500).json({ success: false, message: "Server error: " + e.message });
  }
};

/** LIST for current user */
export const getSubjects = async (req, res) => {
  try {
    const q = {};
    if (req.user.role === "faculty") q["facultyAssignments.faculty"] = req.user.id;
    if (req.user.role === "coordinator") q.coordinator = req.user.id;

    const subjects = await Subject.find(q)
      .populate("coordinator", "name email")
      .populate("facultyAssignments.faculty", "name email");

    res.json({ success: true, data: subjects });
  } catch (e) {
    console.error("getSubjects:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** UPDATE (coordinator) */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    Object.assign(subject, req.body);
    const saved = await subject.save();
    res.json({ success: true, data: saved });
  } catch (e) {
    console.error("updateSubject:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** COURSE OBJECTIVES */
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
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    res.json({ success: true, data: subject });
  } catch (e) {
    console.error("addCourseObjective:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** COMPONENTS */
export const getComponents = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({
      _id: id,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    res.json({ success: true, data: subject.components || [] });
  } catch (e) {
    console.error("getComponents:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** 🔥 UPDATED: Save components with questions support */
export const saveComponents = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    const { components, name, maxMarks, enabled, questions } = req.body;
    let next = [];

    if (Array.isArray(components)) {
      next = components.map((c) => ({
        name: String(c.name || "").trim(),
        maxMarks: Math.max(0, Number(c.maxMarks) || 0),
        enabled: !!c.enabled,
        questions: Math.max(1, Math.min(10, Number(c.questions) || 3)), // 🔥 NEW: Store questions (1-10)
      }));
    } else if (name !== undefined && maxMarks !== undefined) {
      const nm = String(name || "").trim();
      const mm = Number(maxMarks);
      const qq = Math.max(1, Math.min(10, Number(questions) || 3)); // 🔥 NEW: Handle questions
      
      if (!nm || Number.isNaN(mm) || mm < 0) {
        return res.status(400).json({ success: false, message: "Invalid name/maxMarks" });
      }
      
      const list = subject.components || [];
      const idx = list.findIndex((x) => x.name.toLowerCase() === nm.toLowerCase());
      if (idx >= 0) {
        list[idx] = { 
          ...list[idx], 
          name: nm, 
          maxMarks: mm, 
          enabled: enabled ?? list[idx].enabled,
          questions: qq // 🔥 NEW: Update questions
        };
      } else {
        list.push({ name: nm, maxMarks: mm, enabled: enabled ?? true, questions: qq });
      }
      next = list;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Provide components array OR single name/maxMarks" });
    }

    subject.components = next;
    await subject.save();
    res.json({ success: true, data: subject.components });
  } catch (e) {
    console.error("saveComponents:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** FACULTY ASSIGNMENTS */
export const assignFacultyToSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { facultyId, subgroup } = req.body;
    if (!facultyId || !subgroup) {
      return res.status(400).json({ success: false, message: "Faculty ID and subgroup are required" });
    }

    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });
    if (!faculty) return res.status(400).json({ success: false, message: "Invalid faculty member" });

    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    const exists = subject.facultyAssignments.find(
      (a) => String(a.faculty) === facultyId && a.subgroup === subgroup
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This faculty is already assigned to this subgroup",
      });
    }

    subject.facultyAssignments.push({ faculty: facultyId, subgroup });
    await subject.save();
    await subject.populate("facultyAssignments.faculty", "name email");
    res.json({ success: true, data: subject });
  } catch (e) {
    console.error("assignFacultyToSubject:", e);
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

    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    res.json({ success: true, data: subject.facultyAssignments });
  } catch (e) {
    console.error("getFacultyAssignments:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFacultyAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    subject.facultyAssignments = subject.facultyAssignments.filter(
      (a) => String(a._id) !== String(assignmentId)
    );
    await subject.save();
    await subject.populate("facultyAssignments.faculty", "name email");
    res.json({ success: true, data: subject });
  } catch (e) {
    console.error("removeFacultyAssignment:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFacultyList = async (_req, res) => {
  try {
    const list = await User.find({ role: "faculty" }, "name email");
    res.json({ success: true, data: list });
  } catch (e) {
    console.error("getFacultyList:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
