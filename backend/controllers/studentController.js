// import Student from "../models/Student.js";
// import Subject from "../models/Subject.js";

// export const uploadStudents = async (req, res) => {
//   try {
//     const { subjectId, students } = req.body;

//     if (!subjectId || !students || !Array.isArray(students)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Subject ID and students array are required" 
//       });
//     }

//     // Verify subject ownership or faculty assignment
//     const subject = await Subject.findOne({
//       _id: subjectId,
//       $or: [
//         { coordinator: req.user.id },
//         { 'facultyAssignments.faculty': req.user.id }
//       ]
//     });

//     if (!subject) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Subject not found or unauthorized" 
//       });
//     }

//     // Clear existing students for this subject
//     await Student.deleteMany({ subject: subjectId });

//     // Prepare student documents
//     const studentDocs = students
//       .filter(student => student['Roll No.'] && student['Name'])
//       .map(student => ({
//         rollNo: student['Roll No.'],
//         name: student['Name'],
//         subgroup: student['Subgroup'] || '',
//         branch: student['Branch'] || '',
//         subject: subjectId,
//         marks: {
//           MST: student['MST'] ? Number(student['MST']) : null,
//           EST: student['EST'] ? Number(student['EST']) : null,
//           Sessional: student['Sessional'] ? Number(student['Sessional']) : null,
//           Lab: student['Lab'] ? Number(student['Lab']) : null
//         }
//       }));

//     if (studentDocs.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "No valid student data found" 
//       });
//     }

//     // Insert students
//     const savedStudents = await Student.insertMany(studentDocs);

//     // Update subject total students count
//     await Subject.findByIdAndUpdate(subjectId, { 
//       totalStudents: savedStudents.length 
//     });

//     res.json({ 
//       success: true, 
//       data: { 
//         studentsUploaded: savedStudents.length,
//         students: savedStudents 
//       } 
//     });
//   } catch (error) {
//     console.error("Upload students error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const getStudentsBySubject = async (req, res) => {
//   try {
//     const { subjectId } = req.params;

//     // Verify access to subject
//     const subject = await Subject.findOne({
//       _id: subjectId,
//       $or: [
//         { coordinator: req.user.id },
//         { 'facultyAssignments.faculty': req.user.id }
//       ]
//     });

//     if (!subject) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Subject not found or unauthorized" 
//       });
//     }

//     const students = await Student.find({ subject: subjectId });
//     res.json({ success: true, data: students });
//   } catch (error) {
//     console.error("Get students error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const getSubjectAnalytics = async (req, res) => {
//   try {
//     const { subjectId } = req.params;

//     // Verify access to subject
//     const subject = await Subject.findOne({
//       _id: subjectId,
//       $or: [
//         { coordinator: req.user.id },
//         { 'facultyAssignments.faculty': req.user.id }
//       ]
//     });

//     if (!subject) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Subject not found or unauthorized" 
//       });
//     }

//     const students = await Student.find({ subject: subjectId });

//     // Calculate analytics
//     const totalStudents = students.length;
//     const subgroups = [...new Set(students.map(s => s.subgroup).filter(Boolean))];
//     const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];

//     const analytics = {
//       totalStudents,
//       subgroupCount: subgroups.length,
//       branchCount: branches.length,
//       subgroups,
//       branches,
//       subject: {
//         name: subject.name,
//         code: subject.code,
//         semester: subject.semester
//       }
//     };

//     res.json({ success: true, data: analytics });
//   } catch (error) {
//     console.error("Get analytics error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// backend/controllers/studentController.js
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

export const uploadStudents = async (req, res) => {
  try {
    const { subjectId, students } = req.body;
    if (!subjectId || !Array.isArray(students))
      return res.status(400).json({ success: false, message: "Subject ID and students array are required" });

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    const enabledComponents = (subject.components || [])
      .filter((c) => c.enabled)
      .map((c) => c.name);

    // Clear previous entries for this subject
    await Student.deleteMany({ subject: subjectId });

    const docs = [];
    for (const row of students) {
      const roll = row["Roll No."] || row["ROLL NO."] || row.rollNo || row.RollNo;
      const name = row["Name"] || row.name || row.NAME;
      if (!roll || !name) continue;

      const marksMap = {};
      for (const compName of enabledComponents) {
        // pick the column that exactly matches the component name (case-insensitive)
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

    if (!docs.length) return res.status(400).json({ success: false, message: "No valid student data found" });

    const saved = await Student.insertMany(docs);
    await Subject.findByIdAndUpdate(subjectId, { totalStudents: saved.length });

    res.json({ success: true, data: { studentsUploaded: saved.length, students: saved } });
  } catch (e) {
    console.error("Upload students error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStudentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

    const students = await Student.find({ subject: subjectId });
    res.json({ success: true, data: students });
  } catch (e) {
    console.error("Get students error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ coordinator: req.user.id }, { "facultyAssignments.faculty": req.user.id }],
    });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found or unauthorized" });

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
