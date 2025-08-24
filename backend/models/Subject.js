import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  semester: { type: String, required: true },
  courseObjectives: [{ type: String }],
  totalStudents: { type: Number, default: 0 },
  coordinator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  facultyAssignments: [{
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subgroup: { type: String }
  }],
  weightage: {
    MST: { type: Number, default: 0 },
    EST: { type: Number, default: 0 },
    Sessional: { type: Number, default: 0 },
    Lab: { type: Number, default: 0 }
  },
  courseOutcomes: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Subject", subjectSchema);
