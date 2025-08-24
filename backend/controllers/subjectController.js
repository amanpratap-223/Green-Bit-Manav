import Subject from "../models/Subject.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

export const createSubject = async (req, res) => {
  try {
    const { name, code, semester } = req.body;
    
    if (!name || !code || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, code, and semester are required" 
      });
    }

    const subject = new Subject({
      name: name.trim(),
      code: code.trim(),
      semester: semester.trim(),
      coordinator: req.user.id
    });

    const savedSubject = await subject.save();
    res.status(201).json({ success: true, data: savedSubject });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Subject code already exists" 
      });
    }
    console.error("Create subject error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubjects = async (req, res) => {
  try {
    let query = {};
    
    // If user is faculty, show only subjects assigned to them
    if (req.user.role === 'faculty') {
      query['facultyAssignments.faculty'] = req.user.id;
    } else if (req.user.role === 'coordinator') {
      query.coordinator = req.user.id;
    }

    const subjects = await Subject.find(query)
      .populate('coordinator', 'name email')
      .populate('facultyAssignments.faculty', 'name email');
    
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only coordinator can update their subjects
    const subject = await Subject.findOne({ 
      _id: id, 
      coordinator: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    Object.assign(subject, updates);
    const updatedSubject = await subject.save();
    
    res.json({ success: true, data: updatedSubject });
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addCourseObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const { objective } = req.body;

    if (!objective?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Objective is required" 
      });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: id, coordinator: req.user.id },
      { $push: { courseObjectives: objective.trim() } },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    console.error("Add course objective error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const assignFacultyToSubject = async (req, res) => {
  try {
    const { id } = req.params; // subject ID
    const { facultyId, subgroup } = req.body;

    if (!facultyId || !subgroup) {
      return res.status(400).json({ 
        success: false, 
        message: "Faculty ID and subgroup are required" 
      });
    }

    // Verify faculty exists and has correct role
    const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
    if (!faculty) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid faculty member" 
      });
    }

    // Check if this faculty-subgroup combination already exists
    const subject = await Subject.findOne({ 
      _id: id, 
      coordinator: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    // Check for existing assignment
    const existingAssignment = subject.facultyAssignments.find(
      assignment => assignment.faculty.toString() === facultyId && assignment.subgroup === subgroup
    );

    if (existingAssignment) {
      return res.status(400).json({ 
        success: false, 
        message: "This faculty is already assigned to this subgroup" 
      });
    }

    // Add new assignment
    subject.facultyAssignments.push({
      faculty: facultyId,
      subgroup: subgroup
    });

    await subject.save();

    // Populate faculty details for response
    await subject.populate('facultyAssignments.faculty', 'name email');

    res.json({ success: true, data: subject });
  } catch (error) {
    console.error("Assign faculty error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFacultyAssignments = async (req, res) => {
  try {
    const { id } = req.params; // subject ID

    const subject = await Subject.findOne({
      _id: id,
      $or: [
        { coordinator: req.user.id },
        { 'facultyAssignments.faculty': req.user.id }
      ]
    }).populate('facultyAssignments.faculty', 'name email');

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    res.json({ 
      success: true, 
      data: subject.facultyAssignments 
    });
  } catch (error) {
    console.error("Get faculty assignments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFacultyAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params; // subject ID and assignment ID

    const subject = await Subject.findOne({ 
      _id: id, 
      coordinator: req.user.id 
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found or unauthorized" 
      });
    }

    // Remove assignment
    subject.facultyAssignments = subject.facultyAssignments.filter(
      assignment => assignment._id.toString() !== assignmentId
    );

    await subject.save();
    await subject.populate('facultyAssignments.faculty', 'name email');

    res.json({ success: true, data: subject });
  } catch (error) {
    console.error("Remove faculty assignment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }, 'name email');
    res.json({ success: true, data: faculty });
  } catch (error) {
    console.error("Get faculty list error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
