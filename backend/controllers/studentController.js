

import Student from "../models/Student.js";

// Get all students
export const getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

// Add or update a student
export const addOrUpdateStudent = async (req, res) => {
  const { rollNo, name, marks } = req.body;
  let student = await Student.findOne({ rollNo });
  if (student) {
    student.name = name;
    student.marks = marks;
    await student.save();
  } else {
    student = new Student({ rollNo, name, marks });
    await student.save();
  }
  res.json(student);
};
