// backend/controllers/studentController.js
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

/** Upload full student list (coordinator) */
export const uploadStudents = async (req, res) => {
  try {
    const { subjectId, students } = req.body;
    if (!subjectId || !Array.isArray(students)) {
      return res
        .status(400)
        .json({ success: false, message: "Subject ID and students array are required" });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const enabledComponents = (subject.components || [])
      .filter((c) => c.enabled)
      .map((c) => c.name);

    // Replace previous students for this subject
    await Student.deleteMany({ subject: subjectId });

    const docs = [];
    for (const row of students) {
      const roll =
        row["Roll No."] || row["ROLL NO."] || row.rollNo || row.RollNo || row.roll || "";
      const name = row["Name"] || row.name || row.NAME || "";
      if (!roll || !name) continue;

      const marksMap = {};
      for (const compName of enabledComponents) {
        const key = Object.keys(row).find((k) => k.toLowerCase() === compName.toLowerCase());
        const val = key ? row[key] : undefined;
        if (val !== undefined && val !== "") {
          const num = Number(val);
          if (!Number.isNaN(num)) marksMap[compName] = num;
        }
      }

      docs.push({
        rollNo: String(roll),
        name: String(name),
        subgroup: row["Subgroup"] || row["SUBGROUP"] || row.subgroup || "",
        branch: row["Branch"] || row["BRANCH"] || row.branch || "",
        subject: subjectId,
        marks: marksMap,
      });
    }

    if (!docs.length) {
      return res.status(400).json({ success: false, message: "No valid student data found" });
    }

    const saved = await Student.insertMany(docs);
    await Subject.findByIdAndUpdate(subjectId, { totalStudents: saved.length });

    res.json({ success: true, data: { studentsUploaded: saved.length, students: saved } });
  } catch (e) {
    console.error("Upload students error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Read students for a subject (coordinator or assigned faculty) */
export const getStudentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const students = await Student.find({ subject: subjectId });
    res.json({ success: true, data: students });
  } catch (e) {
    console.error("Get students error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Aggregates / counts & returns components (for UI) */
export const getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const students = await Student.find({ subject: subjectId });
    const totalStudents = students.length;
    const subgroups = [...new Set(students.map((s) => s.subgroup).filter(Boolean))];
    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))];

    res.json({
      success: true,
      data: {
        totalStudents,
        subgroupCount: subgroups.length,
        branchCount: branches.length,
        subgroups,
        branches,
        subject: { name: subject.name, code: subject.code, semester: subject.semester },
        components: subject.components || [],
      },
    });
  } catch (e) {
    console.error("Get analytics error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Faculty bulk marks update for an existing subject’s students.
 * Accepts:
 *  PUT /api/students/subject/:subjectId/marks
 *  {
 *    rows: [
 *      { rollNo: "1023...", MST: 24, EST: 50, Sessional: 9, ... },
 *      { rollNo: "1023...", marks: { MST: 20, Project: 10 } }
 *    ]
 *  }
 */
export const bulkUpsertMarks = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: "rows array is required" });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const enabledMap = new Map(
      (subject.components || [])
        .filter((c) => c.enabled)
        .map((c) => [c.name.toLowerCase(), c.maxMarks])
    );

    let updated = 0;
    const notFound = [];
    const errors = [];

    for (const row of rows) {
      const roll = String(row.rollNo || row["Roll No."] || row.roll || "").trim();
      if (!roll) continue;

      const student = await Student.findOne({ subject: subjectId, rollNo: roll });
      if (!student) {
        notFound.push(roll);
        continue;
      }

      // Merge marks from either flat keys or a "marks" object
      const candidate = { ...(row.marks || {}) };
      for (const k of Object.keys(row)) {
        if (["rollno", "roll no.", "roll", "marks"].includes(k.toLowerCase())) continue;
        if (enabledMap.has(k.toLowerCase())) candidate[k] = row[k];
      }

      let changed = false;
      for (const [comp, valRaw] of Object.entries(candidate)) {
        const keyLower = comp.toLowerCase();
        if (!enabledMap.has(keyLower)) continue;

        const val = Number(valRaw);
        const max = enabledMap.get(keyLower);
        if (Number.isNaN(val)) continue;
        if (val < 0 || val > max) {
          errors.push({ rollNo: roll, component: comp, reason: `Out of range (0-${max})` });
          continue;
        }
        student.marks.set(comp, val);
        changed = true;
      }

      if (changed) {
        await student.save();
        updated++;
      }
    }

    res.json({ success: true, data: { updated, notFound, errors } });
  } catch (e) {
    console.error("bulkUpsertMarks error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
