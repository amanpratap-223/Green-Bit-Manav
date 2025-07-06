import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  marks: {
    CO1: { type: mongoose.Schema.Types.Mixed, default: null },
    CO2: { type: mongoose.Schema.Types.Mixed, default: null },
    CO3: { type: mongoose.Schema.Types.Mixed, default: null },
    CO4: { type: mongoose.Schema.Types.Mixed, default: null },
    CO5: { type: mongoose.Schema.Types.Mixed, default: null },
    CO6: { type: mongoose.Schema.Types.Mixed, default: null },
    CO7: { type: mongoose.Schema.Types.Mixed, default: null },
    CO8: { type: mongoose.Schema.Types.Mixed, default: null }
  }
});

export default mongoose.model("Student", studentSchema);
