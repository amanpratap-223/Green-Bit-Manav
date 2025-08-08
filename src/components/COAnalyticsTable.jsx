import React, { useEffect, useState } from "react";

export default function COAnalyticsTable({ refreshTrigger, coColumns }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    setAnalytics(null);
    fetch("http://localhost:5000/api/analytics/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coColumns })
    })
      .then(res => res.json())
      .then(data => setAnalytics(data.coDetails));
  }, [refreshTrigger, coColumns]);

  if (!analytics) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <span>Loading analytics...</span>
    </div>
  );

  // Map analytics to coColumns order
  const analyticsByCol = coColumns.map(co =>
    analytics.find(c => c.co === co) || {
      co,
      targetValue: "-",
      studentsNA: "-",
      studentsConsidered: "-",
      studentsAboveTV: "-",
      percentAchievingTV: "-",
      attainmentLevel: "-",
      indirectScore3: "-",
      overallScore: "-"
    }
  );

  const rows = [
    {
      metric: "Target value (TV)",
      data: analyticsByCol.map(c => c.targetValue),
      className: "text-red-600 font-bold"
    },
    {
      metric: "Students (NA)",
      data: analyticsByCol.map(c => c.studentsNA)
    },
    {
      metric: "Students considered",
      data: analyticsByCol.map(c => c.studentsConsidered)
    },
    {
      metric: "Students with marks >= TV",
      data: analyticsByCol.map(c => c.studentsAboveTV),
      className: "font-bold"
    },
    {
      metric: "% of students achieving the TV",
      data: analyticsByCol.map(c => c.percentAchievingTV),
      className: "text-red-600 font-bold"
    },
    {
      metric: "CO Attainment Level",
      data: analyticsByCol.map(c => c.attainmentLevel),
      className: "bg-green-200 font-bold"
    },
    {
      metric: "Indirect Score (3 Pt Scale)",
      data: analyticsByCol.map(c => c.indirectScore3),
      className: "text-red-600"
    },
    {
      metric: "Overall Score",
      data: analyticsByCol.map(c => c.overallScore),
      className: "text-red-600 font-bold"
    }
  ];

  return (
    <div className="overflow-x-auto my-6 max-w-7xl mx-auto border-4 border-red-600 rounded-lg">
      <table className="min-w-full border-collapse text-center bg-white text-xs sm:text-sm">
        <thead>
          <tr className="bg-red-100">
            <th className="border p-2 font-bold text-lg w-48 bg-white"></th>
            {coColumns.map(co => (
              <th key={co} className="border p-2 font-bold text-lg">{co}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border p-2 font-semibold text-left bg-gray-50">{row.metric}</td>
              {row.data.map((val, j) => (
                <td
                  key={j}
                  className={`border p-2 ${row.className || ""} ${
                    row.metric === "CO Attainment Level" && val === 0
                      ? "bg-red-400 text-white font-bold"
                      : ""
                  }`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
