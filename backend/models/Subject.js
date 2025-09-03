import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
    questions: { type: Number, default: 3, min: 1, max: 10 }, // Number of questions per component
  },
  { _id: false }
);

// 🔥 NEW: Course Outcome schema for CO Matrix
const courseOutcomeSchema = new mongoose.Schema(
  {
    coNumber: { type: String, required: true }, // CO1, CO2, CO3, etc.
    description: { type: String, default: "" },
    measurementTool: { type: String, default: "" }, // MST Q1, EST Q6, Lab, etc.
    toolType: { type: String, enum: ["E", "I"], default: "E" }, // E = External, I = Internal
    marksAssigned: { type: Number, default: 0 },
    targetValue: { type: Number, default: 0 },
    // These will be calculated dynamically
    studentsNA: { type: Number, default: 0 },
    studentsConsidered: { type: Number, default: 0 },
    studentsAchievingTV: { type: Number, default: 0 },
    percentageAchieving: { type: Number, default: 0 },
    attainmentLevel: { type: Number, enum: [0, 1, 2, 3], default: 0 },
    indirectScore5pt: { type: Number, default: 0 },
    indirectScore3pt: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
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
    
    // 🔥 NEW: CO Matrix configuration
    coMatrix: {
      type: [courseOutcomeSchema],
      default: () => Array.from({ length: 8 }, (_, i) => ({
        coNumber: `CO${i + 1}`,
        description: `Course Outcome ${i + 1}`,
        measurementTool: "",
        toolType: "E",
        marksAssigned: 0,
        targetValue: 0,
        studentsNA: 0,
        studentsConsidered: 0,
        studentsAchievingTV: 0,
        percentageAchieving: 0,
        attainmentLevel: 0,
        indirectScore5pt: 0,
        indirectScore3pt: 0,
        overallScore: 0,
      }))
    },

    // 🔥 NEW: Additional CO Matrix fields
    instructor: { type: String, default: "" },
    session: { type: String, default: "" },

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
