// import React, { useState, useEffect } from "react";
// import Spreadsheet from "react-spreadsheet";

// // Converts backend student array to react-spreadsheet format
// function studentsToSheet(students) {
//   const header = [
//     { value: "Roll No" },
//     { value: "Name" },
//     { value: "CO1" },
//     { value: "CO2" },
//     { value: "CO3" },
//     { value: "CO4" },
//     { value: "CO5" },
//     { value: "CO6" },
//     { value: "CO7" },
//     { value: "CO8" }
//   ];
//   const rows = students.map(s => [
//     { value: s.rollNo },
//     { value: s.name },
//     { value: s.marks.CO1 },
//     { value: s.marks.CO2 },
//     { value: s.marks.CO3 },
//     { value: s.marks.CO4 },
//     { value: s.marks.CO5 },
//     { value: s.marks.CO6 },
//     { value: s.marks.CO7 },
//     { value: s.marks.CO8 }
//   ]);
//   return [header, ...rows];
// }

// // Converts spreadsheet data back to array of student objects
// function sheetToStudents(data) {
//   // Remove header row
//   const rows = data.slice(1);
//   return rows.map(row => ({
//     rollNo: row[0]?.value ?? "",
//     name: row[1]?.value ?? "",
//     marks: {
//       CO1: row[2]?.value,
//       CO2: row[3]?.value,
//       CO3: row[4]?.value,
//       CO4: row[5]?.value,
//       CO5: row[6]?.value,
//       CO6: row[7]?.value,
//       CO7: row[8]?.value,
//       CO8: row[9]?.value,
//     }
//   }));
// }

// const DEFAULT_HEADER = [
//   { value: "Roll No" },
//   { value: "Name" },
//   { value: "CO1" },
//   { value: "CO2" },
//   { value: "CO3" },
//   { value: "CO4" },
//   { value: "CO5" },
//   { value: "CO6" },
//   { value: "CO7" },
//   { value: "CO8" }
// ];

// const COTable = () => {
//   const [data, setData] = useState([DEFAULT_HEADER]); // Spreadsheet data
//   const [loading, setLoading] = useState(true);

//   // Fetch students from backend on mount
//   useEffect(() => {
//     fetch("http://localhost:5000/api/students")
//       .then(res => res.json())
//       .then(students => {
//         if (students && students.length > 0) {
//           setData(studentsToSheet(students));
//         } else {
//           setData([DEFAULT_HEADER]);
//         }
//         setLoading(false);
//       })
//       .catch(() => {
//         setData([DEFAULT_HEADER]);
//         setLoading(false);
//       });
//   }, []);

//   // Add Row at the end
//   const handleAddRow = () => {
//     const numCols = data[0].length;
//     const newRow = Array(numCols).fill().map(() => ({ value: "" }));
//     setData([...data, newRow]);
//   };

//   // Remove last row (not the header)
//   const handleRemoveRow = () => {
//     if (data.length > 2) setData(data.slice(0, -1));
//   };

//   // Add Column at the end
//   const handleAddColumn = () => {
//     const colName = prompt("Enter column name:", "New Column") || "New Column";
//     setData(prev =>
//       prev.map((row, rowIdx) => [
//         ...row,
//         { value: rowIdx === 0 ? colName : "" }
//       ])
//     );
//   };

//   // Remove last column
//   const handleRemoveColumn = () => {
//     if (data[0].length > 1) {
//       setData(prev => prev.map(row => row.slice(0, -1)));
//     }
//   };

//   // (Optional) Save changes back to backend
//   // You can call this after edits, or add a Save button
//   const saveToBackend = () => {
//     const students = sheetToStudents(data);
//     // Save each student (could be optimized for batch saving)
//     Promise.all(
//       students.map(student =>
//         fetch("http://localhost:5000/api/students", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(student)
//         })
//       )
//     ).then(() => {
//       alert("Saved to backend!");
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[200px]">
//         <span>Loading...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-[3px] rounded-2xl bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 max-w-6xl mx-auto my-8">
//       <div className="bg-white rounded-2xl shadow-2xl py-6 px-4 min-h-[70vh] overflow-x-auto">
//         <div className="flex flex-wrap gap-2 mb-4">
//           <button
//             className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
//             onClick={handleAddRow}
//           >
//             Add Row
//           </button>
//           <button
//             className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//             onClick={handleRemoveRow}
//             disabled={data.length <= 2}
//             style={{ opacity: data.length <= 2 ? 0.5 : 1 }}
//           >
//             Remove Row
//           </button>
//           <button
//             className="px-4 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
//             onClick={handleAddColumn}
//           >
//             Add Column
//           </button>
//           <button
//             className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
//             onClick={handleRemoveColumn}
//             disabled={data[0].length <= 1}
//             style={{ opacity: data[0].length <= 1 ? 0.5 : 1 }}
//           >
//             Remove Column
//           </button>
//           {/* Optional Save Button */}
//           <button
//             className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
//             onClick={saveToBackend}
//           >
//             Save to Backend
//           </button>
//         </div>
//         <div className="w-full min-w-[700px]">
//           <Spreadsheet data={data} onChange={setData} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default COTable;

import React, { useState, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";

// Converts backend student array to react-spreadsheet format
function studentsToSheet(students) {
  const header = [
    { value: "Roll No" },
    { value: "Name" },
    { value: "CO1" },
    { value: "CO2" },
    { value: "CO3" },
    { value: "CO4" },
    { value: "CO5" },
    { value: "CO6" },
    { value: "CO7" },
    { value: "CO8" }
  ];
  const rows = students.map(s => [
    { value: s.rollNo },
    { value: s.name },
    { value: s.marks.CO1 },
    { value: s.marks.CO2 },
    { value: s.marks.CO3 },
    { value: s.marks.CO4 },
    { value: s.marks.CO5 },
    { value: s.marks.CO6 },
    { value: s.marks.CO7 },
    { value: s.marks.CO8 }
  ]);
  return [header, ...rows];
}

// Converts spreadsheet data back to array of student objects
function sheetToStudents(data) {
  // Remove header row
  const rows = data.slice(1);
  return rows.map(row => ({
    rollNo: row[0]?.value ?? "",
    name: row[1]?.value ?? "",
    marks: {
      CO1: row[2]?.value,
      CO2: row[3]?.value,
      CO3: row[4]?.value,
      CO4: row[5]?.value,
      CO5: row[6]?.value,
      CO6: row[7]?.value,
      CO7: row[8]?.value,
      CO8: row[9]?.value,
    }
  }));
}

const DEFAULT_HEADER = [
  { value: "Roll No" },
  { value: "Name" },
  { value: "CO1" },
  { value: "CO2" },
  { value: "CO3" },
  { value: "CO4" },
  { value: "CO5" },
  { value: "CO6" },
  { value: "CO7" },
  { value: "CO8" }
];

const COTable = ({ onMatrixSaved }) => {
  const [data, setData] = useState([DEFAULT_HEADER]); // Spreadsheet data
  const [loading, setLoading] = useState(true);

  // Fetch students from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then(res => res.json())
      .then(students => {
        if (students && students.length > 0) {
          setData(studentsToSheet(students));
        } else {
          setData([DEFAULT_HEADER]);
        }
        setLoading(false);
      })
      .catch(() => {
        setData([DEFAULT_HEADER]);
        setLoading(false);
      });
  }, []);

  // Add Row at the end
  const handleAddRow = () => {
    const numCols = data[0].length;
    const newRow = Array(numCols).fill().map(() => ({ value: "" }));
    setData([...data, newRow]);
  };

  // Remove last row (not the header)
  const handleRemoveRow = () => {
    if (data.length > 2) setData(data.slice(0, -1));
  };

  // Add Column at the end
  const handleAddColumn = () => {
    const colName = prompt("Enter column name:", "New Column") || "New Column";
    setData(prev =>
      prev.map((row, rowIdx) => [
        ...row,
        { value: rowIdx === 0 ? colName : "" }
      ])
    );
  };

  // Remove last column
  const handleRemoveColumn = () => {
    if (data[0].length > 1) {
      setData(prev => prev.map(row => row.slice(0, -1)));
    }
  };

  // Save changes back to backend and trigger analytics refresh
  const saveToBackend = () => {
    const students = sheetToStudents(data);
    Promise.all(
      students.map(student =>
        fetch("http://localhost:5000/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student)
        })
      )
    ).then(() => {
      alert("Saved to backend!");
      if (onMatrixSaved) onMatrixSaved(); // trigger analytics refresh
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-[3px] rounded-2xl bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 max-w-6xl mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-2xl py-6 px-4 min-h-[70vh] overflow-x-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            onClick={handleAddRow}
          >
            Add Row
          </button>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleRemoveRow}
            disabled={data.length <= 2}
            style={{ opacity: data.length <= 2 ? 0.5 : 1 }}
          >
            Remove Row
          </button>
          <button
            className="px-4 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            onClick={handleAddColumn}
          >
            Add Column
          </button>
          <button
            className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
            onClick={handleRemoveColumn}
            disabled={data[0].length <= 1}
            style={{ opacity: data[0].length <= 1 ? 0.5 : 1 }}
          >
            Remove Column
          </button>
          <button
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={saveToBackend}
          >
            Save to Backend
          </button>
        </div>
        <div className="w-full min-w-[700px]">
          <Spreadsheet data={data} onChange={setData} />
        </div>
      </div>
    </div>
  );
};

export default COTable;
