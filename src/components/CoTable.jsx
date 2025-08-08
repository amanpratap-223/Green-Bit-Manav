import React, { useState, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";

// Converts backend student array to react-spreadsheet format
function studentsToSheet(students, coColumns) {
  const header = [
    { value: "Roll No" },
    { value: "Name" },
    ...coColumns.map(col => ({ value: col }))
  ];
  const rows = students.map(s => [
    { value: s.rollNo },
    { value: s.name },
    ...coColumns.map(col => ({ value: s.marks[col] }))
  ]);
  return [header, ...rows];
}

function sheetToStudents(data, coColumns) {
  const rows = data.slice(1);
  return rows.map(row => {
    const marks = {};
    coColumns.forEach((co, i) => {
      marks[co] = row[i + 2]?.value;
    });
    return {
      rollNo: row[0]?.value ?? "",
      name: row[1]?.value ?? "",
      marks
    };
  });
}

const COTable = ({ onMatrixSaved, coColumns, setCoColumns }) => {
  const [data, setData] = useState([[]]);
  const [loading, setLoading] = useState(true);

  // Fetch students from backend on mount or coColumns change
  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then(res => res.json())
      .then(students => {
        if (students && students.length > 0) {
          setData(studentsToSheet(students, coColumns));
        } else {
          setData([
            [
              { value: "Roll No" },
              { value: "Name" },
              ...coColumns.map(co => ({ value: co }))
            ]
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setData([
          [
            { value: "Roll No" },
            { value: "Name" },
            ...coColumns.map(co => ({ value: co }))
          ]
        ]);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [coColumns]);

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

  // Add Column at the end (adds to coColumns in parent)
  const handleAddColumn = () => {
    const colName = prompt("Enter column name:", `CO${coColumns.length + 1}`) || `CO${coColumns.length + 1}`;
    if (!coColumns.includes(colName)) {
      setCoColumns([...coColumns, colName]);
    }
  };

  // Remove last column (from coColumns in parent)
  const handleRemoveColumn = () => {
    if (coColumns.length > 1) {
      setCoColumns(coColumns.slice(0, -1));
    }
  };

  // Save changes back to backend and trigger analytics refresh
  const saveToBackend = () => {
    const students = sheetToStudents(data, coColumns);
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
            Add Student
          </button>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleRemoveRow}
            disabled={data.length <= 2}
            style={{ opacity: data.length <= 2 ? 0.5 : 1 }}
          >
            Remove Student
          </button>
          <button
            className="px-4 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            onClick={handleAddColumn}
          >
            Add CO
          </button>
          <button
            className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
            onClick={handleRemoveColumn}
            disabled={coColumns.length <= 1}
            style={{ opacity: coColumns.length <= 1 ? 0.5 : 1 }}
          >
            Remove CO
          </button>
          <button
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={saveToBackend}
          >
            Save to Backend
          </button>
        </div>
        <div className="w-full min-w-[700px]">
          <Spreadsheet
            data={data}
            onChange={setData}
            hideColumnIndicators={true} // This line hides A, B, C... column headers
          />
        </div>
      </div>
    </div>
  );
};

export default COTable;
