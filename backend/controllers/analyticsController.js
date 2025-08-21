// controllers/analyticsController.js
import Student from "../models/Student.js"; // Import model directly

const ATTAINMENT_THRESHOLDS = [
  { min: 80, level: 3 },
  { min: 70, level: 2 },
  { min: 60, level: 1 },
  { min: 0,  level: 0 },
];

function getAttainmentLevel(percent) {
  for (const t of ATTAINMENT_THRESHOLDS) {
    if (percent >= t.min) return t.level;
  }
  return 0;
}

export const calculateCOAnalytics = async (req, res) => {
  try {
    // const Student = getStudentModel(req.roleDb); // No longer needed

    const coColumns =
      req.body.coColumns ?? ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"];

    const students = await Student.find().lean();
    const coDetails = [];

    for (const co of coColumns) {
      const tv = 4;
      const indirect3 = 2.5;

      const valid = students.filter((s) => {
        const v = s?.marks?.[co];
        return v !== null && v !== undefined && v !== "" && v !== "NA";
      });

      const studentsNA = students.length - valid.length;
      const studentsConsidered = valid.length;
      const studentsAboveTV = valid.filter((s) => Number(s.marks[co]) >= tv).length;
      const percentAchievingTV =
        studentsConsidered > 0 ? (studentsAboveTV / studentsConsidered) * 100 : 0;

      const attainmentLevel = getAttainmentLevel(percentAchievingTV);
      
      const overallScore =
        (0.8 * attainmentLevel + 0.2 * indirect3).toFixed(2);

      coDetails.push({
        co,
        targetValue: tv,
        studentsNA,
        studentsConsidered,
        studentsAboveTV,
        percentAchievingTV: percentAchievingTV.toFixed(2),
        attainmentLevel,
        indirectScore3: indirect3,
        overallScore,
      });
    }

    res.json({ success: true, data: { coDetails } });
  } catch (err) {
    console.error("calculateCOAnalytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};