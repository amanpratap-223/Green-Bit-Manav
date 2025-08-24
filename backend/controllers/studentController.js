import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

export const uploadStudents = async (req, res) => {
  try {
    const { subjectId, students } = req.body;

    if (!subjectId || !students || !Array.isArray(students)) {
      return res.status(400).json({ 
        success: false, 
        message: "Subject ID and students array are required" 
      });
    }

    // Verify subject ownership or faculty assignment
    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [
        { coordinator: req.user.id },
        { 'facultyAssignments.faculty': req.user.id }
      ]
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    // Clear existing students for this subject
    await Student.deleteMany({ subject: subjectId });

    // Prepare student documents
    const studentDocs = students
      .filter(student => student['Roll No.'] && student['Name'])
      .map(student => ({
        rollNo: student['Roll No.'],
        name: student['Name'],
        subgroup: student['Subgroup'] || '',
        branch: student['Branch'] || '',
        subject: subjectId,
        marks: {
          MST: student['MST'] ? Number(student['MST']) : null,
          EST: student['EST'] ? Number(student['EST']) : null,
          Sessional: student['Sessional'] ? Number(student['Sessional']) : null,
          Lab: student['Lab'] ? Number(student['Lab']) : null
        }
      }));

    if (studentDocs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid student data found" 
      });
    }

    // Insert students
    const savedStudents = await Student.insertMany(studentDocs);

    // Update subject total students count
    await Subject.findByIdAndUpdate(subjectId, { 
      totalStudents: savedStudents.length 
    });

    res.json({ 
      success: true, 
      data: { 
        studentsUploaded: savedStudents.length,
        students: savedStudents 
      } 
    });
  } catch (error) {
    console.error("Upload students error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStudentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify access to subject
    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [
        { coordinator: req.user.id },
        { 'facultyAssignments.faculty': req.user.id }
      ]
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    const students = await Student.find({ subject: subjectId });
    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify access to subject
    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [
        { coordinator: req.user.id },
        { 'facultyAssignments.faculty': req.user.id }
      ]
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    const students = await Student.find({ subject: subjectId });

    // Calculate analytics
    const totalStudents = students.length;
    const subgroups = [...new Set(students.map(s => s.subgroup).filter(Boolean))];
    const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];

    const analytics = {
      totalStudents,
      subgroupCount: subgroups.length,
      branchCount: branches.length,
      subgroups,
      branches,
      subject: {
        name: subject.name,
        code: subject.code,
        semester: subject.semester
      }
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
