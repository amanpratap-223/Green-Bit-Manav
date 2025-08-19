// src/pages/StudentReport.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FILTERS = ["All", "MST", "EST", "Sessional", "Lab"];

export default function StudentReport({ subjects }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects[idx];

  const [activeFilter, setActiveFilter] = useState("All");

  const rows = useMemo(() => subject?.students || [], [subject]);
  if (!subject) {
    return <div className="p-6 text-center text-red-500">Subject not found.</div>;
  }

  // Decide which assessment columns to show
  const showAll = activeFilter === "All";
  const showMST = showAll || activeFilter === "MST";
  const showEST = showAll || activeFilter === "EST";
  const showSessional = showAll || activeFilter === "Sessional";
  const showLab = showAll || activeFilter === "Lab";

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

        {/* KPI cards (simple like your UI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">TOTAL STUDENTS</p>
            <p className="text-3xl font-semibold mt-2">{rows.length || 0}</p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">SUBGROUPS</p>
            <p className="text-3xl font-semibold mt-2">
              {new Set(rows.map(r => String(r.Subgroup || "").trim())).size || 0}
            </p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">BRANCHES</p>
            <p className="text-3xl font-semibold mt-2">
              {new Set(rows.map(r => String(r.Branch || "").trim())).size || 0}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-blue-600 text-white rounded-t-lg px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Students Data</h2>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <label
                key={f}
                className={`px-3 py-1 rounded cursor-pointer border ${
                  activeFilter === f ? "bg-white text-blue-700 border-white" : "bg-blue-500/40 border-blue-300"
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
                    <td className="p-4 text-center text-gray-500 border" colSpan={showAll ? 8 : 5}>
                      No data. Go back and upload an Excel file.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
