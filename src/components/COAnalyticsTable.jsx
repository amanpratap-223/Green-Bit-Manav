// import React from "react";

// // You can change these arrays to match your actual analytics!
// const CO_ANALYTICS = [
//   {
//     metric: "Measurement Tool used",
//     data: ["MST Q1", "EST Q6", "EST Q2", "Lab", "Lab", "I", "I", "I"],
//   },
//   {
//     metric: "Type of Tool (E or I)",
//     data: ["E", "E", "E", "I", "I", "I", "I", "I"],
//   },
//   {
//     metric: "Marks Assigned",
//     data: [6, 8, 8, 7, 8, 7, 0, 0],
//   },
//   {
//     metric: "Target value (TV)",
//     data: [3, 4, 4, 4.8, 4.2, 0, 0, 0],
//     className: "text-red-600 font-bold",
//   },
//   {
//     metric: "Students (NA)",
//     data: [11, 25, 8, 7, 6, 0, 0, 0],
//   },
//   {
//     metric: "Students considered",
//     data: [107, 93, 110, 111, 112, 118, 118, 118],
//   },
//   {
//     metric: "Students with marks >= TV",
//     data: [83, 78, 99, 93, 87, 0, 0, 0],
//     className: "font-bold",
//   },
//   {
//     metric: "% of students achieving the TV",
//     data: [77.6, 83.9, 90.0, 83.8, 77.7, 0.0, 0.0, 0.0],
//     className: "text-red-600 font-bold",
//   },
//   {
//     metric: "CO Attinment Level",
//     data: [3, 3, 3, 3, 3, 0, 0, 0],
//     className: "bg-green-200 font-bold",
//   },
//   {
//     metric: "Indirect Score (5 Pt Scale)",
//     data: [4.26, 4.36, 4.34, 4.10, 4.24, "-", "-", "-"],
//     className: "text-red-600",
//   },
//   {
//     metric: "Indirect Score (3 Pt Scale)",
//     data: [2.56, 2.62, 2.60, 2.46, 2.54, "-", "-", "-"],
//     className: "text-red-600",
//   },
//   {
//     metric: "Overall Score",
//     data: [2.91, 2.92, 2.92, 2.89, 2.91, "#VALUE!", "#VALUE!", "#VALUE!"],
//     className: "text-red-600 font-bold",
//   },
// ];

// const CO_NAMES = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"];

// export default function COAnalyticsTable() {
//   return (
//     <div className="overflow-x-auto my-6 max-w-7xl mx-auto border-4 border-red-600 rounded-lg">
//       <table className="min-w-full border-collapse text-center bg-white text-xs sm:text-sm">
//         <thead>
//           <tr className="bg-red-100">
//             <th className="border p-2 font-bold text-lg w-48 bg-white"></th>
//             {CO_NAMES.map(co => (
//               <th key={co} className="border p-2 font-bold text-lg">{co}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {CO_ANALYTICS.map((row, i) => (
//             <tr key={i}>
//               <td className="border p-2 font-semibold text-left bg-gray-50">{row.metric}</td>
//               {row.data.map((val, j) => (
//                 <td
//                   key={j}
//                   className={`border p-2 ${row.className || ""} ${
//                     row.metric === "CO Attinment Level" && val === 0
//                       ? "bg-red-400 text-white font-bold"
//                       : ""
//                   }`}
//                 >
//                   {val}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import React, { useState } from "react";

const INITIAL_HEADER = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"];
const INITIAL_ROWS = [
  { metric: "Measurement Tool used", data: ["MST Q1", "EST Q6", "EST Q2", "Lab", "Lab", "I", "I", "I"] },
  { metric: "Type of Tool (E or I)", data: ["E", "E", "E", "I", "I", "I", "I", "I"] },
  { metric: "Marks Assigned", data: [6, 8, 8, 7, 8, 7, 0, 0] },
  { metric: "Target value (TV)", data: [3, 4, 4, 4.8, 4.2, 0, 0, 0], className: "text-red-600 font-bold" },
  { metric: "Students (NA)", data: [11, 25, 8, 7, 6, 0, 0, 0] },
  { metric: "Students considered", data: [107, 93, 110, 111, 112, 118, 118, 118] },
  { metric: "Students with marks >= TV", data: [83, 78, 99, 93, 87, 0, 0, 0], className: "font-bold" },
  { metric: "% of students achieving the TV", data: [77.6, 83.9, 90.0, 83.8, 77.7, 0.0, 0.0, 0.0], className: "text-red-600 font-bold" },
  { metric: "CO Attinment Level", data: [3, 3, 3, 3, 3, 0, 0, 0], className: "bg-green-200 font-bold" },
  { metric: "Indirect Score (5 Pt Scale)", data: [4.26, 4.36, 4.34, 4.10, 4.24, "-", "-", "-"], className: "text-red-600" },
  { metric: "Indirect Score (3 Pt Scale)", data: [2.56, 2.62, 2.60, 2.46, 2.54, "-", "-", "-"], className: "text-red-600" },
  { metric: "Overall Score", data: [2.91, 2.92, 2.92, 2.89, 2.91, "#VALUE!", "#VALUE!", "#VALUE!"], className: "text-red-600 font-bold" },
];

export default function COAnalyticsTable() {
  const [headers, setHeaders] = useState(INITIAL_HEADER);
  const [rows, setRows] = useState(INITIAL_ROWS);

  // Add a new row
  const handleAddRow = () => {
    const metric = prompt("Enter metric name for new row:", "New Metric");
    if (!metric) return;
    setRows([...rows, { metric, data: Array(headers.length).fill("") }]);
  };

  // Remove last row
  const handleRemoveRow = () => {
    if (rows.length > 1) setRows(rows.slice(0, -1));
  };

  // Add a column
  const handleAddColumn = () => {
    const colName = prompt("Enter new CO/column name:", "New CO");
    if (!colName) return;
    setHeaders([...headers, colName]);
    setRows(rows.map(row => ({
      ...row,
      data: [...row.data, ""]
    })));
  };

  // Remove last column
  const handleRemoveColumn = () => {
    if (headers.length > 1) {
      setHeaders(headers.slice(0, -1));
      setRows(rows.map(row => ({
        ...row,
        data: row.data.slice(0, -1)
      })));
    }
  };

  // Optional: make cells editable if you want
  const handleCellChange = (rowIdx, colIdx, value) => {
    setRows(rows => rows.map((row, r) =>
      r === rowIdx
        ? { ...row, data: row.data.map((cell, c) => c === colIdx ? value : cell) }
        : row
    ));
  };

  return (
    <div className="overflow-x-auto my-6 max-w-7xl mx-auto border-4 border-red-600 rounded-lg">
      <div className="flex flex-wrap gap-2 mb-4 mt-4 justify-center">
        <button
          className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={handleAddRow}
        >Add Row</button>
        <button
          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleRemoveRow}
          disabled={rows.length <= 1}
          style={{ opacity: rows.length <= 1 ? 0.5 : 1 }}
        >Remove Row</button>
        <button
          className="px-4 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
          onClick={handleAddColumn}
        >Add Column</button>
        <button
          className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
          onClick={handleRemoveColumn}
          disabled={headers.length <= 1}
          style={{ opacity: headers.length <= 1 ? 0.5 : 1 }}
        >Remove Column</button>
      </div>
      <table className="min-w-full border-collapse text-center bg-white text-xs sm:text-sm">
        <thead>
          <tr className="bg-red-100">
            <th className="border p-2 font-bold text-lg w-48 bg-white"></th>
            {headers.map((co, i) => (
              <th key={i} className="border p-2 font-bold text-lg">{co}</th>
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
                    row.metric === "CO Attinment Level" && val === 0
                      ? "bg-red-400 text-white font-bold"
                      : ""
                  }`}
                  // Uncomment the block below to make analytics cells editable:
                  // contentEditable
                  // suppressContentEditableWarning
                  // onBlur={e => handleCellChange(i, j, e.target.innerText)}
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
