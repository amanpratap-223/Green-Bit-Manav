import mongoose from "mongoose";

const courseOutcomeSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    coNumber: {
      type: String,
      required: true, // CO1, CO2, CO3, etc.
    },
    description: {
      type: String,
      required: true,
    },
    measurementTool: {
      type: String,
      required: true, // MST Q1, EST Q6, Lab, etc.
    },
    toolType: {
      type: String,
      enum: ["E", "I"], // E = External, I = Internal
      required: true,
    },
    marksAssigned: {
      type: Number,
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    // Calculated fields (will be computed dynamically)
    studentsNA: {
      type: Number,
      default: 0,
    },
    studentsConsidered: {
      type: Number,
      default: 0,
    },
    studentsAchievingTV: {
      type: Number,
      default: 0,
    },
    percentageAchieving: {
      type: Number,
      default: 0,
    },
    attainmentLevel: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    indirectScore5pt: {
      type: Number,
      default: 0,
    },
    indirectScore3pt: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for subject + CO number
courseOutcomeSchema.index({ subject: 1, coNumber: 1 }, { unique: true });

export default mongoose.model("CourseOutcome", courseOutcomeSchema);
