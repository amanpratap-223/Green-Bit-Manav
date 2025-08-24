import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function SubjectDetail({ subjects, user, onUpdateSubject }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects[idx];
  const [newObjective, setNewObjective] = useState("");

  if (!subject) {
    return <div className="p-6 text-center text-red-500">Subject not found.</div>;
  }

  const handleAddObjective = async () => {
    if (!newObjective.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/subjects/${subject._id}/objectives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ objective: newObjective.trim() })
      });

      const data = await response.json();
      if (data.success) {
        const updatedSubject = { ...subject, courseObjectives: data.data.courseObjectives };
        onUpdateSubject(updatedSubject, idx);
        setNewObjective("");
      } else {
        alert("Error saving objective: " + data.message);
      }
    } catch (error) {
      console.error("Error saving objective:", error);
      alert("Error saving objective");
    }
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Roll No.": "102315044",
        Name: "Sample Name",
        Subgroup: "3021",
        Branch: "ENC",
        MST: "22",
        EST: "25",
        Sessional: "10",
        Lab: "15",
      },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "StudentsTemplate");
    XLSX.writeFile(wb, `${subject.code}_StudentsTemplate.xlsx`);
  };

  const handleUploadStudents = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        console.log("Parsed Excel data:", jsonData); // Debug log

        if (jsonData.length === 0) {
          alert("The Excel file appears to be empty.");
          return;
        }

        // Upload to backend
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/students/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            subjectId: subject._id,
            students: jsonData
          })
        });

        const result = await response.json();
        console.log("Backend response:", result); // Debug log

        if (result.success) {
          alert(`Successfully uploaded ${result.data.studentsUploaded} students!`);
          
          // Update local subject state with the uploaded count
          const updatedSubject = { 
            ...subject, 
            totalStudents: result.data.studentsUploaded,
            students: jsonData // Keep local copy for immediate display
          };
          onUpdateSubject(updatedSubject, idx);
          
          // Navigate to report page
          navigate(`/subject/${idx}/report`);
        } else {
          alert("Error uploading students: " + result.message);
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("Error processing Excel file: " + error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="pl-72 pt-8 pr-8 pb-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">
          {subject.name} ({subject.code})
        </h1>
        <p className="text-gray-600 mb-6">
          Semester: <span className="font-semibold">{subject.semester}</span>
        </p>

        {/* Course Objectives */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Course Objectives</h2>
          {user?.role === "coordinator" && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="border rounded px-3 py-2 flex-1"
                placeholder="Enter course objective"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
              />
              <button
                onClick={handleAddObjective}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          )}
          <ul className="list-decimal list-inside space-y-1 text-gray-800">
            {(subject.courseObjectives || []).map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>

        {/* Student Management */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Students</h2>
          {user?.role === "coordinator" && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleDownloadTemplate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download Template
              </button>
              <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700">
                Upload Student Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleUploadStudents}
                  className="hidden"
                />
              </label>
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p>Total Students: <span className="font-semibold">{subject.totalStudents || 0}</span></p>
            {subject.totalStudents > 0 && (
              <button
                onClick={() => navigate(`/subject/${idx}/report`)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
