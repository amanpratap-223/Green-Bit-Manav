// backend/controllers/facultyController.js
import Subject from "../models/Subject.js";
import Student from "../models/Student.js";

/**
 * GET /api/faculty/subject/:subjectId/roster
 * Returns: subject meta, enabled components, and roster (restricted to faculty's assigned subgroups)
 */
export const getFacultyRoster = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    })
      .populate("coordinator", "name email")
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    // Which subgroups is this faculty allowed to see?
    const myAssignments = (subject.facultyAssignments || []).filter(
      (a) => String(a.faculty) === String(req.user.id)
    );
    const mySubgroups = Array.from(new Set(myAssignments.map((a) => a.subgroup).filter(Boolean)));

    if (req.user.role === "faculty" && mySubgroups.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to any subgroup for this subject",
      });
    }

    const rosterQuery = { subject: subjectId };
    if (req.user.role === "faculty") {
      rosterQuery.subgroup = { $in: mySubgroups };
    }

    const students = await Student.find(rosterQuery).lean();

    const enabledComponents = (subject.components || []).filter((c) => c.enabled);

    const rows = students.map((s) => {
      const base = {
        rollNo: s.rollNo,
        name: s.name,
        subgroup: s.subgroup || "",
        branch: s.branch || "",
      };
      // include current marks (if any) for enabled components
      const marks = s.marks || {};
      for (const c of enabledComponents) {
        base[c.name] = marks?.[c.name] ?? "";
      }
      return base;
    });

    res.json({
      success: true,
      data: {
        subject: {
          id: String(subject._id),
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          coordinator: subject.coordinator || null,
          courseObjectives: subject.courseObjectives || [],
        },
        components: enabledComponents,
        roster: rows,
        allowedSubgroups: mySubgroups, // helpful for client UX
      },
    });
  } catch (err) {
    console.error("getFacultyRoster:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/faculty/subject/:subjectId/upload-marks
 * Body: { records: [ { rollNo, marks: { "MST": 23, "EST": 55, ... } } ] }
 * Updates marks for allowed students & enabled components.
 */
export const uploadFacultyMarks = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "records array is required" });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    }).lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    const myAssignments = (subject.facultyAssignments || []).filter(
      (a) => String(a.faculty) === String(req.user.id)
    );
    const mySubgroups = Array.from(new Set(myAssignments.map((a) => a.subgroup).filter(Boolean)));

    if (req.user.role === "faculty" && mySubgroups.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to any subgroup for this subject",
      });
    }

    const enabled = (subject.components || []).filter((c) => c.enabled);
    const caps = Object.fromEntries(enabled.map((c) => [c.name.toLowerCase(), c.maxMarks]));

    const ops = [];
    let totalRows = 0;
    let totalFields = 0;
    let skippedRows = 0;

    for (const rec of records) {
      const rollNo = (rec.rollNo || rec["Roll No."] || rec["ROLL NO."] || "").toString().trim();
      if (!rollNo) {
        skippedRows++;
        continue;
      }
      const marksObj = rec.marks || {};

      // build $set for enabled components only
      const $set = {};
      for (const [key, raw] of Object.entries(marksObj)) {
        const canonical = key.toLowerCase();
        if (!(canonical in caps)) continue; // unknown or disabled component
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0 || num > caps[canonical]) continue; // invalid value
        $set[`marks.${key}`] = num;
        totalFields++;
      }
      if (Object.keys($set).length === 0) {
        skippedRows++;
        continue;
      }

      const filter = { subject: subjectId, rollNo };
      // faculty can update only their subgroups
      if (req.user.role === "faculty") {
        filter.subgroup = { $in: mySubgroups };
      }

      ops.push({
        updateOne: {
          filter,
          update: { $set },
        },
      });
      totalRows++;
    }

    if (ops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid marks found to update",
      });
    }

    const bulk = await Student.bulkWrite(ops, { ordered: false });

    res.json({
      success: true,
      data: {
        rowsProcessed: totalRows,
        fieldsUpdated: totalFields,
        skippedRows,
        matched: bulk.matchedCount ?? 0,
        modified: bulk.modifiedCount ?? 0,
      },
    });
  } catch (err) {
    console.error("uploadFacultyMarks:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
