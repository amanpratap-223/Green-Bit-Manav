import Student from "../models/Student.js";

const ATTAINMENT_THRESHOLDS = [
  { min: 80, level: 3 },
  { min: 70, level: 2 },
  { min: 60, level: 1 },
  { min: 0,  level: 0 }
];

function getAttainmentLevel(percent) {
  for (const t of ATTAINMENT_THRESHOLDS) {
    if (percent >= t.min) return t.level;
  }
  return 0;
}

export const calculateCOAnalytics = async (req, res) => {
  try {
    // Accept dynamic coColumns array
    const coColumns = req.body.coColumns || ["CO1","CO2","CO3","CO4","CO5","CO6","CO7","CO8"];
    // You may want to accept target values and scores per CO from req.body in the future
    const students = await Student.find({});
    const coDetails = [];

    for (const co of coColumns) {
      const tv = 4; // or customize for each CO
      const indirect3 = 2.5; // or customize per CO

      // Filter out students with NA or missing marks
      const validStudents = students.filter(s => s.marks[co] !== null && s.marks[co] !== undefined && s.marks[co] !== "NA" && s.marks[co] !== "");
      const studentsNA = students.length - validStudents.length;
      const studentsConsidered = validStudents.length;
      const studentsAboveTV = validStudents.filter(s => Number(s.marks[co]) >= tv).length;
      const percentAchievingTV = studentsConsidered > 0 ? (studentsAboveTV / studentsConsidered) * 100 : 0;
      const attainmentLevel = getAttainmentLevel(percentAchievingTV);

      // Overall Score (0.8 * attainmentLevel + 0.2 * indirect3)
      const overallScore = attainmentLevel && indirect3
        ? (0.8 * attainmentLevel + 0.2 * indirect3).toFixed(2)
        : 0;

      coDetails.push({
        co,
        targetValue: tv,
        studentsNA,
        studentsConsidered,
        studentsAboveTV,
        percentAchievingTV: percentAchievingTV.toFixed(2),
        attainmentLevel,
        indirectScore3: indirect3,
        overallScore
      });
    }

    res.json({ coDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
