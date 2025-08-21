// controllers/studentController.js
import Student from "../models/Student.js"; // Import model directly

export const getAllStudents = async (req, res) => {
  try {
    // const Student = getStudentModel(req.roleDb); // No longer needed
    const list = await Student.find().lean();
    res.json({ success: true, data: list });
  } catch (e) {
    console.error("getAllStudents error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addOrUpdateStudent = async (req, res) => {
  try {
    // const Student = getStudentModel(req.roleDb); // No longer needed
    const { rollNo, name, marks } = req.body;
    if (!rollNo || !name) {
      return res.status(400).json({ success: false, message: "rollNo and name are required" });
    }
    const doc = await Student.findOneAndUpdate(
      { rollNo },
      { $set: { name, marks } },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    console.error("addOrUpdateStudent error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};