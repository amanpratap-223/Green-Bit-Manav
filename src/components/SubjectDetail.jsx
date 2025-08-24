
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function SubjectDetail({ subjects, user, onUpdateSubject }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects[idx];

  const [newObjective, setNewObjective] = useState("");
  const [components, setComponents] = useState([]); // [{ name, maxMarks, enabled }]
  const [showAddComp, setShowAddComp] = useState(false);
  const [compName, setCompName] = useState("");
  const [compMax, setCompMax] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!subject?._id) return;
      try {
        const token = localStorage.getItem("authToken");
        const r = await fetch(
          `http://localhost:5000/api/subjects/${subject._id}/components`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const j = await r.json();
        if (j.success) setComponents(j.data || []);
      } catch (e) {
        console.error("Load components error:", e);
      }
    };
    load();
  }, [subject?._id]);

  if (!subject) {
    return (
      <div className="p-6 text-center text-red-500">Subject not found.</div>
    );
  }

  const handleAddObjective = async () => {
    if (!newObjective.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/subjects/${subject._id}/objectives`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ objective: newObjective.trim() }),
        }
      );
      const data = await res.json();
      if (data.success) {
        const updatedSubject = {
          ...subject,
          courseObjectives: data.data.courseObjectives,
        };
        onUpdateSubject(updatedSubject, idx);
        setNewObjective("");
      } else {
        alert("Error saving objective: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error saving objective");
    }
  };

  const handleSaveComponents = async (nextList) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/subjects/${subject._id}/components`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ components: nextList }),
        }
      );
      const j = await res.json();
      if (j.success) {
        setComponents(j.data);
      } else {
        alert(j.message || "Failed to save components");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving components");
    }
  };

  const handleAddComponent = async () => {
    const name = compName.trim();
    const max = Number(compMax);
    if (!name || Number.isNaN(max)) return;
    const next = [...components, { name, maxMarks: max, enabled: true }];
    await handleSaveComponents(next);
    setCompName("");
    setCompMax("");
    setShowAddComp(false);
  };

  const handleToggleEnable = async (name) => {
    const next = components.map((c) =>
      c.name === name ? { ...c, enabled: !c.enabled } : c
    );
    await handleSaveComponents(next);
  };

  const handleRemoveComponent = async (name) => {
    const next = components.filter((c) => c.name !== name);
    await handleSaveComponents(next);
  };

  const handleDownloadTemplate = () => {
    const base = {
      "Roll No.": "102315044",
      Name: "Sample Name",
      Subgroup: "3021",
      Branch: "ENC",
    };
    for (const c of components.filter((x) => x.enabled)) {
      base[c.name] = "";
    }
    const ws = XLSX.utils.json_to_sheet([base]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentsTemplate");
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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (jsonData.length === 0) {
          alert("The Excel file appears to be empty.");
          return;
        }

        const token = localStorage.getItem("authToken");
        const response = await fetch(
          "http://localhost:5000/api/students/upload",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              subjectId: subject._id,
              students: jsonData,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          alert(
            `Successfully uploaded ${result.data.studentsUploaded} students!`
          );
          const updatedSubject = {
            ...subject,
            totalStudents: result.data.studentsUploaded,
            students: jsonData,
          };
          onUpdateSubject(updatedSubject, idx);
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
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          {subject.name} ({subject.code})
        </h1>
        <p className="text-gray-600 mb-6">
          Semester: <span className="font-semibold">{subject.semester}</span>
        </p>

        {/* Components Card */}
        <div className="mb-8">
          <div className="p-5 bg-white border rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Enter Components</h3>
              {user?.role === "coordinator" && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => setShowAddComp((s) => !s)}
                >
                  + Add
                </button>
              )}
            </div>

            {showAddComp && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="border rounded px-3 py-2"
                    placeholder="Component name (e.g., MST)"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    className="border rounded px-3 py-2"
                    placeholder="Max marks (e.g., 30)"
                    value={compMax}
                    onChange={(e) => setCompMax(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddComponent}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 w-full"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddComp(false);
                        setCompName("");
                        setCompMax("");
                      }}
                      className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 w-full"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(components || []).length === 0 ? (
                <p className="text-sm text-gray-400">
                  No components added yet.
                </p>
              ) : (
                components.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-500">Max: {c.maxMarks}</span>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={c.enabled}
                          onChange={() => handleToggleEnable(c.name)}
                        />
                        <span className="text-gray-700">Enabled</span>
                      </label>
                    </div>
                    {user?.role === "coordinator" && (
                      <button
                        onClick={() => handleRemoveComponent(c.name)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Course Objectives */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Course Objectives
          </h2>
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
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={handleDownloadTemplate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download Template
              </button>
              <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700 whitespace-nowrap">
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
            <p>
              Total Students:{" "}
              <span className="font-semibold">
                {subject.totalStudents || 0}
              </span>
            </p>
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
