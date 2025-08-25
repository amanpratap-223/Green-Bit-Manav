// backend/models/Subject.js
import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    semester: { type: String, required: true },

    courseObjectives: [{ type: String }],
    courseOutcomes: [{ type: String }],

    totalStudents: { type: Number, default: 0 },

    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    facultyAssignments: [
      {
        faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        subgroup: { type: String },
      },
    ],

    components: { type: [componentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
