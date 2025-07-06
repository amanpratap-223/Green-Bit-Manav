// import Student from "../models/Student.js";

// const CO_LIST = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"];
// const ATTAINMENT_THRESHOLDS = [
//   { min: 80, level: 3 },
//   { min: 70, level: 2 },
//   { min: 60, level: 1 },
//   { min: 0,  level: 0 }
// ];

// function getAttainmentLevel(percent) {
//   for (const t of ATTAINMENT_THRESHOLDS) {
//     if (percent >= t.min) return t.level;
//   }
//   return 0;
// }

// export const calculateCOAnalytics = async (req, res) => {
//   try {
//     // You can accept these from req.body or set defaults here
//     const targetValues = req.body.targetValues || { CO1: 3, CO2: 4, CO3: 4, CO4: 4.8, CO5: 4.2, CO6: 0, CO7: 0, CO8: 0 };
//     const indirectScores5 = req.body.indirectScores5 || { CO1: 4.26, CO2: 4.36, CO3: 4.34, CO4: 4.10, CO5: 4.24, CO6: 0, CO7: 0, CO8: 0 };
//     const indirectScores3 = req.body.indirectScores3 || { CO1: 2.56, CO2: 2.62, CO3: 2.60, CO4: 2.46, CO5: 2.54, CO6: 0, CO7: 0, CO8: 0 };

//     const students = await Student.find({});
//     const coDetails = [];

//     for (const co of CO_LIST) {
//       const tv = targetValues[co];
//       const indirect5 = indirectScores5[co];
//       const indirect3 = indirectScores3[co];

//       // Filter out students with NA or missing marks
//       const validStudents = students.filter(s => s.marks[co] !== null && s.marks[co] !== undefined && s.marks[co] !== "NA");
//       const studentsNA = students.length - validStudents.length;
//       const studentsConsidered = validStudents.length;
//       const studentsAboveTV = validStudents.filter(s => Number(s.marks[co]) >= tv).length;
//       const percentAchievingTV = studentsConsidered > 0 ? (studentsAboveTV / studentsConsidered) * 100 : 0;
//       const attainmentLevel = getAttainmentLevel(percentAchievingTV);

//       // Overall Score (example: 0.8 * attainmentLevel + 0.2 * indirect3)
//       const overallScore = attainmentLevel && indirect3
//         ? (0.8 * attainmentLevel + 0.2 * indirect3).toFixed(2)
//         : 0;

//       coDetails.push({
//         co,
//         measurementTool: "",
//         toolType: "",
//         marksAssigned: null,
//         targetValue: tv,
//         studentsNA,
//         studentsConsidered,
//         studentsAboveTV,
//         percentAchievingTV: percentAchievingTV.toFixed(2),
//         attainmentLevel,
//         indirectScore5: indirect5,
//         indirectScore3: indirect3,
//         overallScore
//       });
//     }

//     res.json({ coDetails });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import Student from "../models/Student.js";

const CO_LIST = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"];
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
    // These values can be customized or fetched from DB/config
    const targetValues = req.body.targetValues || { CO1: 3, CO2: 4, CO3: 4, CO4: 4.8, CO5: 4.2, CO6: 0, CO7: 0, CO8: 0 };
    const indirectScores5 = req.body.indirectScores5 || { CO1: 4.26, CO2: 4.36, CO3: 4.34, CO4: 4.10, CO5: 4.24, CO6: 0, CO7: 0, CO8: 0 };
    const indirectScores3 = req.body.indirectScores3 || { CO1: 2.56, CO2: 2.62, CO3: 2.60, CO4: 2.46, CO5: 2.54, CO6: 0, CO7: 0, CO8: 0 };

    const students = await Student.find({});
    const coDetails = [];

    for (const co of CO_LIST) {
      const tv = targetValues[co];
      const indirect5 = indirectScores5[co];
      const indirect3 = indirectScores3[co];

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
