// src/pages/FacultyLanding.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function FacultyLanding({ user, subjects }) {
  const token = useMemo(() => localStorage.getItem("authToken"), []);
  const mySubjects = useMemo(() => {
    const me = String(user?.id || user?._id || "");
    return (subjects || []).filter((s) =>
      (s.facultyAssignments || []).some((a) => {
        const fid =
          (a.faculty && (a.faculty._id || a.faculty.id)) || a.faculty || "";
        return String(fid) === me;
      })
    );
  }, [subjects, user]);

  // we’ll show one card per assigned subject
  const [rowsBySubj, setRowsBySubj] = useState({});          // { [subjId]: [rows] }
  const [compsBySubj, setCompsBySubj] = useState({});        // { [subjId]: [{name,maxMarks,enabled}] }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      for (const s of mySubjects) {
        try {
          // components from analytics (already filtered/enabled)
          const an = await fetch(
            `http://localhost:5000/api/students/analytics/${s._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then((r) => r.json());
          if (an.success) {
            setCompsBySubj((m) => ({
              ...m,
              [s._id]: (an.data.components || []).filter((c) => c.enabled),
            }));
          }

          // students list + existing marks
          const st = await fetch(
            `http://localhost:5000/api/students/subject/${s._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then((r) => r.json());
          if (st.success) {
            const enabledNames = (an.data?.components || [])
              .filter((c) => c.enabled)
              .map((c) => c.name);
            const rows = (st.data || []).map((stu) => {
              const base = {
                rollNo: stu.rollNo,
                name: stu.name,
                subgroup: stu.subgroup || "",
                branch: stu.branch || "",
              };
              enabledNames.forEach((n) => (base[n] = stu.marks?.[n] ?? ""));
              return base;
            });
            setRowsBySubj((m) => ({ ...m, [s._id]: rows }));
          }
        } catch (e) {
          console.error("Faculty load error:", e);
        }
      }
    })();
  }, [mySubjects, token]);

  const handleCellChange = (subjId, rowIdx, compName, value) => {
    setRowsBySubj((m) => {
      const rows = [...(m[subjId] || [])];
      rows[rowIdx] = { ...rows[rowIdx], [compName]: value };
      return { ...m, [subjId]: rows };
    });
  };

  const handleSave = async (subjId) => {
    try {
      setSaving(true);
      const rows = (rowsBySubj[subjId] || []).map((r) => {
        const { rollNo, name, subgroup, branch, ...rest } = r;
        return {
          rollNo,
          marks: rest,
        };
      });
      const res = await fetch(
        `http://localhost:5000/api/students/subject/${subjId}/marks`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rows }),
        }
      ).then((r) => r.json());
      if (res.success) {
        alert(`Marks saved. Updated: ${res.data.updated}`);
      } else {
        alert(res.message || "Failed to save marks");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const firstName = (user?.name || "").split(" ")[0] || user?.name || "";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* page title (no sidebar, single top navbar handled by App layout) */}
      <h1 className="text-3xl font-bold mb-1">Faculty Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {firstName}</p>

      {mySubjects.length === 0 && (
        <div className="p-6 bg-white border rounded-lg">
          <p className="text-gray-500">No subjects assigned yet.</p>
        </div>
      )}

      {mySubjects.map((s) => {
        const rows = rowsBySubj[s._id] || [];
        const comps = compsBySubj[s._id] || [];
        return (
          <div key={s._id} className="bg-white border rounded-lg mb-8">
            {/* Subject header card */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {s.name} ({s.code})
                  </h2>
                  <p className="text-gray-600">Semester: {s.semester}</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Assigned
                </span>
              </div>

              <div className="mt-4 text-sm">
                <p className="mb-1">
                  <span className="font-medium">Coordinator:</span>{" "}
                  {s.coordinator?.name || "-"}
                </p>
                {s.courseObjectives?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Course Objectives</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {s.courseObjectives.map((co, i) => (
                        <li key={i}>{co}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Enter Marks */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Enter Marks</h3>
                {/* SINGLE Save button (top-right) */}
                <button
                  onClick={() => handleSave(s._id)}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Marks"}
                </button>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2 border">Roll No.</th>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Subgroup</th>
                      <th className="p-2 border">Branch</th>
                      {comps.map((c) => (
                        <th key={c.name} className="p-2 border capitalize">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={r.rollNo} className="hover:bg-gray-50">
                        <td className="p-2 border">{r.rollNo}</td>
                        <td className="p-2 border">{r.name}</td>
                        <td className="p-2 border">{r.subgroup}</td>
                        <td className="p-2 border">{r.branch}</td>
                        {comps.map((c) => (
                          <td key={c.name} className="p-2 border">
                            <input
                              type="number"
                              min="0"
                              max={c.maxMarks}
                              placeholder={`0 - ${c.maxMarks}`}
                              value={r[c.name] ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  s._id,
                                  idx,
                                  c.name,
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                const raw = e.target.value;
                                if (raw === "") return;
                                let v = Number(raw);
                                if (Number.isNaN(v)) v = "";
                                else
                                  v = Math.max(
                                    0,
                                    Math.min(Number(c.maxMarks), v)
                                  );
                                handleCellChange(s._id, idx, c.name, v);
                              }}
                              className="w-20 border rounded px-2 py-1"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          className="p-4 text-center text-gray-500 border"
                          colSpan={4 + comps.length}
                        >
                          No students found for this subject.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* NOTE: bottom Save button was removed */}
            </div>
          </div>
        );
      })}
    </div>
  );
}
