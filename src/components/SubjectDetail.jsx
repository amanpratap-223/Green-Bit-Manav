import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function SubjectDetail({ subjects }) {
  const { idx } = useParams();
  const subject = subjects[idx];

  const [objectives, setObjectives] = useState([]);
  const [objectiveInput, setObjectiveInput] = useState("");

  // Student file upload/download
  const [studentsFile, setStudentsFile] = useState(null);

  function handleAddObjective() {
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput("");
    }
  }

  function handleDownloadExcel() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Roll No.", "Name", "Branch", "Subgroup"], // header row
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    saveAs(new Blob([excelBuffer]), 'students.xlsx');
  }

  function handleUploadExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, {type:'array'});
      setStudentsFile(workbook);
      alert("File uploaded successfully!");
    };
    reader.readAsArrayBuffer(file);
  }

  if (!subject) return <div>Subject not found.</div>;

  return (
    <div style={{marginLeft: "275px", padding: "40px 30px"}}>
      <h2 className="text-2xl font-bold mb-2">{subject.name} ({subject.code})</h2>
      <p className="mb-2"><strong>Semester:</strong> {subject.semester}</p>
      <div className="mb-4 font-semibold">
        INNOVATION AND ENTREPRENEURSHIP – UTA025-2526ODDSEM
      </div>

      {/* Objectives Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg">Course Objectives</h3>
        <div className="flex items-center mt-2">
          <input
            placeholder="Enter objective..."
            className="border px-2 py-1 rounded mr-2"
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddObjective}>
            Add Course Objective
          </button>
        </div>
        <ul className="mt-3 ml-4">
          {objectives.map((obj, i) => (
            <li key={i}><strong>{i + 1}.</strong> {obj}</li>
          ))}
        </ul>
      </div>

      {/* Students Section */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Students</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleDownloadExcel}>
          Download Blank Excel
        </button>
        <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer">
          Upload Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleUploadExcel}
          />
        </label>
        {studentsFile && <span className="ml-4 text-green-700">Excel file loaded.</span>}
      </div>
    </div>
  );
}
