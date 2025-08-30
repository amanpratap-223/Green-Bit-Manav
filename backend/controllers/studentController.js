import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

/** Upload full student list (coordinator) - UPDATED to handle sub-components */
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
      .filter((c) => c.enabled);

    // Replace previous students for this subject
    await Student.deleteMany({ subject: subjectId });

    const docs = [];
    for (const row of students) {
      const roll =
        row["Roll No."] || row["ROLL NO."] || row.rollNo || row.RollNo || row.roll || "";
      const name = row["Name"] || row.name || row.NAME || "";
      if (!roll || !name) continue;

      const marksMap = {};

      // Process sub-component marks (MST(Q1), MST(Q2), etc.)
      for (const comp of enabledComponents) {
        const compName = comp.name;
        const questionCount = comp.questions || 3;
        
        // Look for sub-component columns
        const subMarks = {};
        let totalMarks = 0;
        let hasSubComponents = false;

        for (let i = 1; i <= questionCount; i++) {
          const subColumnName = `${compName}(Q${i})`;
          const key = Object.keys(row).find((k) => 
            k.toLowerCase() === subColumnName.toLowerCase()
          );
          
          if (key && row[key] !== undefined && row[key] !== "") {
            const num = Number(row[key]);
            if (!Number.isNaN(num)) {
              subMarks[`Q${i}`] = num;
              totalMarks += num;
              hasSubComponents = true;
            }
          }
        }

        if (hasSubComponents) {
          // Store both individual question marks and total
          marksMap[compName] = {
            total: totalMarks,
            breakdown: subMarks
          };
        } else {
          // Fallback: Look for single column (backward compatibility)
          const key = Object.keys(row).find((k) => 
            k.toLowerCase() === compName.toLowerCase()
          );
          const val = key ? row[key] : undefined;
          if (val !== undefined && val !== "") {
            const num = Number(val);
            if (!Number.isNaN(num)) {
              marksMap[compName] = { total: num, breakdown: {} };
            }
          }
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

/** 🔥 FIXED: Bulk upsert marks with proper object handling */
export const bulkUpsertMarks = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: "rows array is required" });
    }

    // Prevent coordinators from editing marks
    if (req.user.role === "coordinator") {
      return res.status(403).json({ 
        success: false, 
        message: "Coordinators cannot edit student marks. This is restricted to faculty members only." 
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    // 🔥 ENHANCED: Get assigned subgroups for faculty users with better logic
    let assignedSubgroups = [];
    if (req.user.role === "faculty") {
      assignedSubgroups = subject.facultyAssignments
        .filter(assignment => {
          const facultyId = assignment.faculty?.toString() || assignment.faculty?._id?.toString() || assignment.faculty;
          return facultyId === req.user.id.toString();
        })
        .map(assignment => assignment.subgroup);
      
      console.log(`Faculty ${req.user.id} assigned subgroups:`, assignedSubgroups);
    }

    const enabledComponents = (subject.components || []).filter((c) => c.enabled);
    const enabledMap = new Map(enabledComponents.map((c) => [c.name.toLowerCase(), c]));

    let updated = 0;
    const notFound = [];
    const errors = [];
    const unauthorized = [];

    for (const row of rows) {
      const roll = String(row.rollNo || row["Roll No."] || row.roll || "").trim();
      if (!roll) continue;

      const student = await Student.findOne({ subject: subjectId, rollNo: roll });
      if (!student) {
        notFound.push(roll);
        continue;
      }

      // 🔥 ENHANCED: Check if faculty is authorized to update this student
      if (req.user.role === "faculty") {
        if (assignedSubgroups.length === 0 || !assignedSubgroups.includes(student.subgroup)) {
          unauthorized.push(roll);
          console.log(`Faculty ${req.user.id} unauthorized for student ${roll} in subgroup ${student.subgroup}`);
          continue;
        }
      }

      // Process marks data properly
      let changed = false;
      const marksData = { ...(row.marks || {}) };
      
      // Extract marks from row data
      for (const k of Object.keys(row)) {
        if (["rollno", "roll no.", "roll", "marks", "name", "subgroup", "branch"].includes(k.toLowerCase())) continue;
        marksData[k] = row[k];
      }

      // Process each enabled component
      for (const comp of enabledComponents) {
        const compName = comp.name;
        const compNameLower = compName.toLowerCase();
        const questionCount = comp.questions || 3;
        const maxPerQuestion = Math.floor(comp.maxMarks / questionCount);

        // Collect sub-question marks for this component
        const subMarks = {};
        let hasSubQuestions = false;
        let totalMarks = 0;

        // Look for sub-question fields like MST(Q1), MST(Q2)
        for (let i = 1; i <= questionCount; i++) {
          const qKey = `${compName}(Q${i})`;
          const qKeyLower = qKey.toLowerCase();
          
          // Find the key in marksData (case insensitive)
          const foundKey = Object.keys(marksData).find(k => k.toLowerCase() === qKeyLower);
          
          if (foundKey && marksData[foundKey] !== undefined && marksData[foundKey] !== "") {
            const val = Number(marksData[foundKey]);
            if (!Number.isNaN(val)) {
              if (val < 0 || val > maxPerQuestion) {
                errors.push({ 
                  rollNo: roll, 
                  component: qKey, 
                  reason: `Out of range (0-${maxPerQuestion})` 
                });
                continue;
              }
              subMarks[`Q${i}`] = val;
              totalMarks += val;
              hasSubQuestions = true;
            }
          }
        }

        // If we have sub-question marks, save the structured data
        if (hasSubQuestions) {
          student.marks.set(compName, {
            total: totalMarks,
            breakdown: subMarks
          });
          changed = true;
        } else {
          // Check for single component mark (backward compatibility)
          const singleKey = Object.keys(marksData).find(k => k.toLowerCase() === compNameLower);
          if (singleKey && marksData[singleKey] !== undefined && marksData[singleKey] !== "") {
            const val = Number(marksData[singleKey]);
            if (!Number.isNaN(val)) {
              if (val < 0 || val > comp.maxMarks) {
                errors.push({ 
                  rollNo: roll, 
                  component: compName, 
                  reason: `Out of range (0-${comp.maxMarks})` 
                });
                continue;
              }
              student.marks.set(compName, {
                total: val,
                breakdown: {}
              });
              changed = true;
            }
          }
        }
      }

      if (changed) {
        try {
          await student.save();
          updated++;
        } catch (saveError) {
          console.error(`Error saving student ${roll}:`, saveError);
          errors.push({ 
            rollNo: roll, 
            component: 'general', 
            reason: 'Failed to save to database' 
          });
        }
      }
    }

    res.json({ success: true, data: { updated, notFound, errors, unauthorized } });
  } catch (e) {
    console.error("bulkUpsertMarks error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔥 ENHANCED: Fixed getStudentsBySubject to ensure all students are returned
export const getStudentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // 🔥 ENHANCED: Better subject lookup with population
    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    }).populate('facultyAssignments.faculty', 'name email');
    
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    let studentQuery = { subject: subjectId };

    // 🔥 ENHANCED: Better faculty filtering logic
    if (req.user.role === "faculty") {
      const assignedSubgroups = subject.facultyAssignments
        .filter(assignment => {
          const facultyId = assignment.faculty?._id?.toString() || assignment.faculty?.toString();
          const match = facultyId === req.user.id.toString();
          if (match) {
            console.log(`✅ Faculty ${req.user.id} assigned to subgroup ${assignment.subgroup}`);
          }
          return match;
        })
        .map(assignment => assignment.subgroup);
      
      console.log(`📋 Faculty ${req.user.id} total assigned subgroups:`, assignedSubgroups);
      
      if (assignedSubgroups.length > 0) {
        studentQuery.subgroup = { $in: assignedSubgroups };
        console.log(`🔍 Student query for faculty:`, studentQuery);
      } else {
        console.log(`❌ No subgroups assigned to faculty ${req.user.id}`);
        return res.json({ success: true, data: [] });
      }
    }

    // 🔥 ENHANCED: Fetch students with detailed logging
    const students = await Student.find(studentQuery).sort({ subgroup: 1, rollNo: 1 });
    console.log(`👥 Found ${students.length} students for query:`, studentQuery);
    
    // 🔥 DEBUG: Log student distribution by subgroup
    const studentsBySubgroup = students.reduce((acc, student) => {
      acc[student.subgroup] = (acc[student.subgroup] || 0) + 1;
      return acc;
    }, {});
    console.log(`📊 Students by subgroup:`, studentsBySubgroup);
    
    res.json({ success: true, data: students });
  } catch (e) {
    console.error("Get students error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔥 ENHANCED: Better analytics with detailed logging
export const getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    }).populate('facultyAssignments.faculty', 'name email');
    
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });
    }

    let studentQuery = { subject: subjectId };

    if (req.user.role === "faculty") {
      const assignedSubgroups = subject.facultyAssignments
        .filter(assignment => {
          const facultyId = assignment.faculty?._id?.toString() || assignment.faculty?.toString();
          return facultyId === req.user.id.toString();
        })
        .map(assignment => assignment.subgroup);
      
      if (assignedSubgroups.length > 0) {
        studentQuery.subgroup = { $in: assignedSubgroups };
      } else {
        return res.json({
          success: true,
          data: {
            totalStudents: 0,
            subgroupCount: 0,
            branchCount: 0,
            subgroups: [],
            branches: [],
            subject: { name: subject.name, code: subject.code, semester: subject.semester },
            components: subject.components || [],
          },
        });
      }
    }

    const students = await Student.find(studentQuery);
    const totalStudents = students.length;
    const subgroups = [...new Set(students.map((s) => s.subgroup).filter(Boolean))];
    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))];

    console.log(`📈 Analytics for subject ${subject.name}: ${totalStudents} students, ${subgroups.length} subgroups`);

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
