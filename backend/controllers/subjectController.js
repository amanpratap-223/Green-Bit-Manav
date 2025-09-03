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

/** UPDATED: Save components with questions support */
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
        questions: Math.max(1, Math.min(10, Number(c.questions) || 3)),
      }));
    } else if (name !== undefined && maxMarks !== undefined) {
      const nm = String(name || "").trim();
      const mm = Number(maxMarks);
      const qq = Math.max(1, Math.min(10, Number(questions) || 3));
      
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
          questions: qq
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

// 🔥 NEW: CO Matrix functionality

/** Get CO Matrix configuration */
export const getCourseOutcomes = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({
      _id: id,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    res.json({ success: true, data: subject.coMatrix || [] });
  } catch (e) {
    console.error("getCourseOutcomes:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Save/Update CO Matrix configuration */
export const saveCourseOutcomes = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseOutcomes } = req.body;

    if (!Array.isArray(courseOutcomes)) {
      return res.status(400).json({ success: false, message: "courseOutcomes must be an array" });
    }

    const subject = await Subject.findOne({ _id: id, coordinator: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    // Validate and sanitize CO data
    const validatedCOs = courseOutcomes.map((co, index) => ({
      coNumber: co.coNumber || `CO${index + 1}`,
      description: String(co.description || "").trim(),
      measurementTool: String(co.measurementTool || "").trim(),
      toolType: ["E", "I"].includes(co.toolType) ? co.toolType : "E",
      marksAssigned: Math.max(0, Number(co.marksAssigned) || 0),
      targetValue: Math.max(0, Number(co.targetValue) || 0),
      studentsNA: Math.max(0, Number(co.studentsNA) || 0),
      studentsConsidered: Math.max(0, Number(co.studentsConsidered) || 0),
      studentsAchievingTV: Math.max(0, Number(co.studentsAchievingTV) || 0),
      percentageAchieving: Math.max(0, Math.min(100, Number(co.percentageAchieving) || 0)),
      attainmentLevel: [0, 1, 2, 3].includes(Number(co.attainmentLevel)) ? Number(co.attainmentLevel) : 0,
      indirectScore5pt: Math.max(0, Math.min(5, Number(co.indirectScore5pt) || 0)),
      indirectScore3pt: Math.max(0, Math.min(3, Number(co.indirectScore3pt) || 0)),
      overallScore: Math.max(0, Number(co.overallScore) || 0),
    }));

    subject.coMatrix = validatedCOs;
    await subject.save();

    res.json({ success: true, data: subject.coMatrix });
  } catch (e) {
    console.error("saveCourseOutcomes:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Calculate CO Matrix metrics */
export const calculateCOMatrix = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findOne({
      _id: id,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    // Get all students for this subject
    const students = await Student.find({ subject: id });

    // Calculate metrics for each CO
    const calculatedCOs = subject.coMatrix.map((co) => {
      let studentsNA = 0;
      let studentsConsidered = 0;
      let studentsAchievingTV = 0;

      if (!co.measurementTool || students.length === 0) {
        return {
          ...co.toObject(),
          studentsNA: 0,
          studentsConsidered: 0,
          studentsAchievingTV: 0,
          percentageAchieving: 0,
          attainmentLevel: 0,
        };
      }

      // Parse measurement tool (e.g., "MST Q1" -> component: MST, question: Q1)
      const toolParts = co.measurementTool.split(" ");
      const componentName = toolParts[0]; // MST, EST, etc.
      const questionPart = toolParts[1]; // Q1, Q2, etc.

      students.forEach((student) => {
        const studentMarks = student.marks;
        let studentScore = null;

        if (studentMarks && studentMarks.get && studentMarks.get(componentName)) {
          const componentMarks = studentMarks.get(componentName);
          
          if (typeof componentMarks === 'object' && componentMarks.breakdown) {
            // Handle sub-component marks structure
            if (questionPart && componentMarks.breakdown[questionPart] !== undefined) {
              studentScore = componentMarks.breakdown[questionPart];
            } else if (componentMarks.total !== undefined) {
              studentScore = componentMarks.total;
            }
          } else if (typeof componentMarks === 'number') {
            // Handle simple number format
            studentScore = componentMarks;
          } else if (typeof componentMarks === 'object' && componentMarks.total !== undefined) {
            // Handle object with total but no breakdown
            studentScore = componentMarks.total;
          }
        }

        if (studentScore === null || studentScore === undefined || studentScore === "") {
          studentsNA++;
        } else {
          studentsConsidered++;
          if (Number(studentScore) >= co.targetValue) {
            studentsAchievingTV++;
          }
        }
      });

      const percentageAchieving = studentsConsidered > 0 
        ? (studentsAchievingTV / studentsConsidered) * 100 
        : 0;

      // Calculate attainment level based on percentage
      let attainmentLevel = 0;
      if (percentageAchieving >= 75) attainmentLevel = 3;
      else if (percentageAchieving >= 50) attainmentLevel = 2;
      else if (percentageAchieving >= 30) attainmentLevel = 1;

      return {
        ...co.toObject(),
        studentsNA,
        studentsConsidered,
        studentsAchievingTV,
        percentageAchieving: Math.round(percentageAchieving * 100) / 100,
        attainmentLevel,
      };
    });

    res.json({ success: true, data: calculatedCOs });
  } catch (e) {
    console.error("calculateCOMatrix:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Validate marks uploaded by faculty */
export const validateMarksUploaded = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findOne({
      _id: id,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    }).populate("facultyAssignments.faculty", "name email");

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const students = await Student.find({ subject: id });
    const enabledComponents = (subject.components || []).filter(c => c.enabled);
    
    // Check if any students have marks for enabled components
    const facultyWithoutMarks = [];
    const assignedSubgroups = new Set();

    subject.facultyAssignments.forEach(assignment => {
      assignedSubgroups.add(assignment.subgroup);
    });

    // Check each assigned subgroup
    for (const assignment of subject.facultyAssignments) {
      const subgroupStudents = students.filter(s => s.subgroup === assignment.subgroup);
      
      if (subgroupStudents.length === 0) continue;

      let hasAnyMarks = false;
      
      // Check if any student in this subgroup has marks for any enabled component
      for (const student of subgroupStudents) {
        for (const component of enabledComponents) {
          const studentMarks = student.marks;
          if (studentMarks && studentMarks.get && studentMarks.get(component.name)) {
            const componentMarks = studentMarks.get(component.name);
            if (componentMarks && 
                ((typeof componentMarks === 'object' && (componentMarks.total > 0 || Object.keys(componentMarks.breakdown || {}).length > 0)) ||
                 (typeof componentMarks === 'number' && componentMarks > 0))) {
              hasAnyMarks = true;
              break;
            }
          }
        }
        if (hasAnyMarks) break;
      }

      if (!hasAnyMarks) {
        facultyWithoutMarks.push({
          faculty: assignment.faculty,
          subgroup: assignment.subgroup,
          studentCount: subgroupStudents.length
        });
      }
    }

    const allMarksUploaded = facultyWithoutMarks.length === 0;

    res.json({ 
      success: true, 
      data: {
        allMarksUploaded,
        totalStudents: students.length,
        enabledComponents: enabledComponents.length,
        facultyWithoutMarks,
        totalFacultyAssignments: subject.facultyAssignments.length
      }
    });
  } catch (e) {
    console.error("validateMarksUploaded:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
