// backend/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true },
    name: { type: String, required: true },
    subgroup: { type: String },
    branch: { type: String },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    // dynamic assessment components (MST/EST/anything)
    marks: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// prevent duplicates per subject
studentSchema.index({ rollNo: 1, subject: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
