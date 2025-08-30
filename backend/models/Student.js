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
    // 🔥 UPDATED: Support both Number and Object formats for marks
    marks: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // 🔥 Changed from Number to Mixed to support objects
      default: {},
    },
  },
  { timestamps: true }
);

// prevent duplicates per subject
studentSchema.index({ rollNo: 1, subject: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
