
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FILTERS = ["All", "MST", "EST", "Sessional", "Lab"];

// Pretend existing faculty directory (you can swap with backend later)
const DEFAULT_FACULTY = [
  "Dr. A. Sharma",
  "Prof. B. Gupta",
  "Dr. C. Verma",
  "Ms. D. Kaur",
];

export default function StudentReport({ subjects }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects[idx];

  const [activeFilter, setActiveFilter] = useState("All");

  // ------- NEW local state for the three extra cards -------
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [facultyList] = useState(DEFAULT_FACULTY); // source of truth for the picker
  const [pendingFaculty, setPendingFaculty] = useState("");
  const [pendingSubgroup, setPendingSubgroup] = useState("");
  const [assignments, setAssignments] = useState([]); // [{name, subgroup}]

  const [weightage, setWeightage] = useState({
    MST: "",
    EST: "",
    Sessional: "",
    Lab: "",
  });
  const [savedWeightage, setSavedWeightage] = useState(null);

  const [newCO, setNewCO] = useState("");
  const [courseOutcomes, setCourseOutcomes] = useState([]);

  // --------------------------------------------------------

  const rows = useMemo(() => subject?.students || [], [subject]);
  if (!subject) {
    return <div className="p-6 text-center text-red-500">Subject not found.</div>;
  }

  // unique subgroups derived from Excel
  const subgroupOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => String(r.Subgroup || "").trim()).filter(Boolean))
      ),
    [rows]
  );

  // Decide which assessment columns to show
  const showAll = activeFilter === "All";
  const showMST = showAll || activeFilter === "MST";
  const showEST = showAll || activeFilter === "EST";
  const showSessional = showAll || activeFilter === "Sessional";
  const showLab = showAll || activeFilter === "Lab";

  // ------- NEW handlers -------
  function handleAddAssignment() {
    if (!pendingFaculty || !pendingSubgroup) return;
    const exists = assignments.some(
      (a) => a.name === pendingFaculty && a.subgroup === pendingSubgroup
    );
    if (!exists) {
      setAssignments((prev) => [
        ...prev,
        { name: pendingFaculty, subgroup: pendingSubgroup },
      ]);
    }
    setPendingFaculty("");
    setPendingSubgroup("");
    setShowFacultyPicker(false);
  }

  function handleSaveWeightage() {
    // Basic validation
    const w = {
      MST: Number(weightage.MST || 0),
      EST: Number(weightage.EST || 0),
      Sessional: Number(weightage.Sessional || 0),
      Lab: Number(weightage.Lab || 0),
    };
    setSavedWeightage(w);
  }

  function handleAddCO() {
    if (!newCO.trim()) return;
    setCourseOutcomes((prev) => [...prev, newCO.trim()]);
    setNewCO("");
  }
  // ----------------------------

  return (
    <div className="pl-72 pt-8 pr-8 pb-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              {subject.name} ({subject.code})
            </h1>
            <p className="text-gray-600">Semester: {subject.semester}</p>
          </div>
          <button
            onClick={() => navigate(`/subject/${idx}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Back to Subject
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">TOTAL STUDENTS</p>
            <p className="text-3xl font-semibold mt-2">{rows.length || 0}</p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">SUBGROUPS</p>
            <p className="text-3xl font-semibold mt-2">
              {new Set(rows.map((r) => String(r.Subgroup || "").trim())).size || 0}
            </p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">BRANCHES</p>
            <p className="text-3xl font-semibold mt-2">
              {new Set(rows.map((r) => String(r.Branch || "").trim())).size || 0}
            </p>
          </div>
        </div>

        {/* ===== NEW: Three extra cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Assign Faculty */}
          <div className="p-5 bg-white border rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Assign Faculty</h3>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => setShowFacultyPicker((s) => !s)}
              >
                Add Faculty
              </button>
            </div>

            {showFacultyPicker && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="mb-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Choose Faculty
                  </label>
                  <select
                    value={pendingFaculty}
                    onChange={(e) => setPendingFaculty(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    {facultyList.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Assign Subgroup
                  </label>
                  <select
                    value={pendingSubgroup}
                    onChange={(e) => setPendingSubgroup(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    {subgroupOptions.map((sg) => (
                      <option key={sg} value={sg}>
                        {sg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAssignment}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => {
                      setShowFacultyPicker(false);
                      setPendingFaculty("");
                      setPendingSubgroup("");
                    }}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-2">Assigned:</p>
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-400">No assignments yet.</p>
              ) : (
                <ul className="space-y-1">
                  {assignments.map((a, i) => (
                    <li
                      key={`${a.name}-${a.subgroup}-${i}`}
                      className="text-sm bg-gray-50 border rounded px-2 py-1"
                    >
                      <span className="font-medium">{a.name}</span>{" "}
                      <span className="text-gray-500">→ Subgroup</span>{" "}
                      <span className="font-medium">{a.subgroup}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Card 2: Enter Weightage */}
          <div className="p-5 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Enter Weightage</h3>
            <div className="grid grid-cols-2 gap-3">
              {["MST", "EST", "Sessional", "Lab"].map((k) => (
                <div key={k} className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">{k}</label>
                  <input
                    type="number"
                    min="0"
                    value={weightage[k]}
                    onChange={(e) =>
                      setWeightage((w) => ({ ...w, [k]: e.target.value }))
                    }
                    placeholder="marks"
                    className="border rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveWeightage}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Save
            </button>

            {savedWeightage && (
              <div className="mt-3 text-sm bg-gray-50 border rounded p-3">
                <p className="font-medium mb-1">Current Weightage</p>
                <div className="grid grid-cols-2 gap-x-6">
                  <span>MST: {savedWeightage.MST}</span>
                  <span>EST: {savedWeightage.EST}</span>
                  <span>Sessional: {savedWeightage.Sessional}</span>
                  <span>Lab: {savedWeightage.Lab}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Enter COs */}
          <div className="p-5 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Enter COs</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCO}
                onChange={(e) => setNewCO(e.target.value)}
                placeholder="Add Course Outcome"
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={handleAddCO}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {courseOutcomes.length > 0 ? (
              <ul className="mt-3 list-decimal list-inside space-y-1 text-sm">
                {courseOutcomes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-400">
                No COs added yet. Add above.
              </p>
            )}
          </div>
        </div>
        {/* ===== End new cards ===== */}

        {/* Filter bar */}
        <div className="bg-blue-600 text-white rounded-t-lg px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Students Data</h2>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <label
                key={f}
                className={`px-3 py-1 rounded cursor-pointer border ${
                  activeFilter === f
                    ? "bg-white text-blue-700 border-white"
                    : "bg-blue-500/40 border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="assess-filter"
                  className="hidden"
                  checked={activeFilter === f}
                  onChange={() => setActiveFilter(f)}
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-blue-200 rounded-b-lg">
          <div className="p-4 text-sm text-gray-600">
            Upload your Excel with columns:
            <span className="ml-1 font-medium">
              Roll No., Name, Subgroup, Branch, MST, EST, Sessional, Lab
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-t border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">ROLL NO.</th>
                  <th className="p-2 border">NAME</th>
                  <th className="p-2 border">SUBGROUP</th>
                  <th className="p-2 border">BRANCH</th>
                  {showMST && <th className="p-2 border">MST</th>}
                  {showEST && <th className="p-2 border">EST</th>}
                  {showSessional && <th className="p-2 border">SESSIONAL</th>}
                  {showLab && <th className="p-2 border">LAB</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border">{s["Roll No."]}</td>
                    <td className="p-2 border">{s["Name"]}</td>
                    <td className="p-2 border">{s["Subgroup"]}</td>
                    <td className="p-2 border">{s["Branch"]}</td>
                    {showMST && <td className="p-2 border">{s["MST"]}</td>}
                    {showEST && <td className="p-2 border">{s["EST"]}</td>}
                    {showSessional && <td className="p-2 border">{s["Sessional"]}</td>}
                    {showLab && <td className="p-2 border">{s["Lab"]}</td>}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="p-4 text-center text-gray-500 border"
                      colSpan={showAll ? 8 : 5}
                    >
                      No data. Go back and upload an Excel file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* /Table */}
      </div>
    </div>
  );
}
