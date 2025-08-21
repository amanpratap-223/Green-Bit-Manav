// models/Student.js
import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  rollNo: { type: String, required: true, unique: true },
  name:   { type: String, required: true },
  marks: {
    CO1: { type: Schema.Types.Mixed, default: null },
    CO2: { type: Schema.Types.Mixed, default: null },
    CO3: { type: Schema.Types.Mixed, default: null },
    CO4: { type: Schema.Types.Mixed, default: null },
    CO5: { type: Schema.Types.Mixed, default: null },
    CO6: { type: Schema.Types.Mixed, default: null },
    CO7: { type: Schema.Types.Mixed, default: null },
    CO8: { type: Schema.Types.Mixed, default: null }
  }
}, { timestamps: true });

// Export the model directly
const Student = mongoose.model("Student", studentSchema);

export default Student;