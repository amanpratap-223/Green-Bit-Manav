import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  subgroup: { type: String },
  branch: { type: String },
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject',
    required: true 
  },
  marks: {
    MST: { type: Number, default: null },
    EST: { type: Number, default: null },
    Sessional: { type: Number, default: null },
    Lab: { type: Number, default: null }
  }
}, { timestamps: true });

// Compound unique index to prevent duplicate students per subject
studentSchema.index({ rollNo: 1, subject: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
