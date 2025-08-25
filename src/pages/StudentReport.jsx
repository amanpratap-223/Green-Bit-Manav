import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const commons = ["MST", "EST", "Sessional", "Lab", "Project"];

export default function StudentReport({ subjects }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects && subjects[idx] ? subjects[idx] : null;

  const [activeFilter, setActiveFilter] = useState("All");
  const [studentsData, setStudentsData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // faculty assignment state
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState("");
  const [pendingSubgroup, setPendingSubgroup] = useState("");
  const [assignments, setAssignments] = useState([]);

  // dynamic components & COs
  const [components, setComponents] = useState(subject?.components || []);
  const [showAddComp, setShowAddComp] = useState(false);
  const [compName, setCompName] = useState("");
  const [compMarks, setCompMarks] = useState("");
  const [newCO, setNewCO] = useState("");
  const [courseOutcomes, setCourseOutcomes] = useState(
    subject?.courseOutcomes || []
  );

  const enabledComponents = useMemo(
    () => (components || []).filter((c) => c.enabled),
    [components]
  );
  const FILTERS = useMemo(
    () => ["All", ...enabledComponents.map((c) => c.name)],
    [enabledComponents]
  );

  const token = useMemo(() => localStorage.getItem("authToken"), []);

  // Load report page data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!subject?._id) {
          setStudentsData(subject?.students || []);
          setIsLoadingData(false);
          return;
        }

        // faculty list & assignments
        const [fl, asg] = await Promise.all([
          fetch("http://localhost:5000/api/subjects/faculty-list", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(
            `http://localhost:5000/api/subjects/${subject._id}/faculty-assignments`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then((r) => r.json()),
        ]);
        if (fl.success) setFacultyList(fl.data || []);
        if (asg.success) setAssignments(asg.data || []);

        // analytics (includes components)
        const an = await fetch(
          `http://localhost:5000/api/students/analytics/${subject._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((r) => r.json());
        if (an.success && an.data) {
          setAnalyticsData(an.data);
          if (Array.isArray(an.data.components)) setComponents(an.data.components);
        } else if (Array.isArray(subject?.components)) {
          setComponents(subject.components);
        }

        // students list
        const st = await fetch(
          `http://localhost:5000/api/students/subject/${subject._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((r) => r.json());

        if (st.success && Array.isArray(st.data)) {
          const currentEnabled =
            (an?.data?.components || [])
              .filter((c) => c.enabled)
              .map((c) => c.name);
          const rows = st.data.map((s) => {
            const base = {
              "Roll No.": s.rollNo,
              Name: s.name,
              Subgroup: s.subgroup || "",
              Branch: s.branch || "",
            };
            const marksObj = s.marks || {};
            currentEnabled.forEach((name) => {
              base[name] = marksObj?.[name] ?? "";
            });
            return base;
          });
          setStudentsData(rows);
        } else {
          setStudentsData(subject?.students || []);
        }

        if (Array.isArray(subject?.courseOutcomes)) {
          setCourseOutcomes(subject.courseOutcomes);
        }
      } catch (e) {
        console.error("Report load error:", e);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject?._id]);

  const rows = useMemo(() => studentsData || [], [studentsData]);
  const subgroupOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => String(r.Subgroup || "").trim()).filter(Boolean))
      ),
    [rows]
  );

  // Faculty assignment
  const handleAddAssignment = async () => {
    if (!pendingFaculty || !pendingSubgroup) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/subjects/${subject._id}/assign-faculty`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facultyId: pendingFaculty,
            subgroup: pendingSubgroup,
          }),
        }
      ).then((r) => r.json());
      if (res.success) {
        setAssignments(res.data.facultyAssignments || []);
        setPendingFaculty("");
        setPendingSubgroup("");
        setShowFacultyPicker(false);
        alert("Faculty assigned successfully!");
      } else {
        alert(res.message || "Error assigning faculty");
      }
    } catch (e) {
      console.error("Assign error:", e);
      alert("Error assigning faculty");
    }
  };

  /** SAVE COMPONENT (send ARRAY as server expects) */
  const handleSaveComponent = async () => {
    const name = compName.trim();
    const maxMarks = Number(compMarks);

    if (!name || Number.isNaN(maxMarks) || maxMarks < 0) {
      alert("Please enter a component name and a non-negative Max Marks.");
      return;
    }

    // upsert by name, case-insensitive
    const next = [
      ...(components || []).filter(
        (c) => c.name.toLowerCase() !== name.toLowerCase()
      ),
      { name, maxMarks, enabled: true },
    ];

    try {
      const res = await fetch(
        `http://localhost:5000/api/subjects/${subject._id}/components`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ components: next }),
        }
      ).then((r) => r.json());

      if (!res.success) {
        alert(res.message || "Failed to save component");
        return;
      }

      setComponents(res.data || []);
      setCompName("");
      setCompMarks("");
      setShowAddComp(false);
    } catch (e) {
      console.error("Save component error:", e);
      alert("Failed to save component");
    }
  };

  // Course Objectives
  const handleAddCO = async () => {
    const txt = (newCO || "").trim();
    if (!txt) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/subjects/${subject._id}/objectives`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ objective: txt }),
        }
      ).then((r) => r.json());
      if (res.success) {
        setCourseOutcomes(res.data.courseObjectives || []);
        setNewCO("");
      } else {
        alert(res.message || "Failed to add CO");
      }
    } catch (e) {
      console.error("Add CO error:", e);
      alert("Failed to add CO");
    }
  };

  const handleDownloadTemplate = () => {
    const header = {
      "Roll No.": "102315044",
      Name: "Sample Name",
      Subgroup: "2C71",
      Branch: "COE",
    };
    enabledComponents.forEach((c) => (header[c.name] = ""));
    const ws = XLSX.utils.json_to_sheet([header]);
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

        const response = await fetch("http://localhost:5000/api/students/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjectId: subject._id,
            students: jsonData,
          }),
        });

        const result = await response.json();
        if (result.success) {
          alert(`Successfully uploaded ${result.data.studentsUploaded} students!`);
          const rows = jsonData.map((r) => {
            const base = {
              "Roll No.": r["Roll No."] || r["ROLL NO."] || r.rollNo || "",
              Name: r["Name"] || r.name || "",
              Subgroup: r["Subgroup"] || r.subgroup || "",
              Branch: r["Branch"] || r.branch || "",
            };
            enabledComponents.forEach((c) => {
              const k = Object.keys(r).find(
                (x) => x.toLowerCase() === c.name.toLowerCase()
              );
              base[c.name] = k ? r[k] : "";
            });
            return base;
          });
          setStudentsData(rows);
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

  if (!subject) {
    return <div className="p-6 text-center text-red-500">Subject not found.</div>;
  }

  if (isLoadingData) {
    return (
      <div className="pl-72 pt-8 pr-8 pb-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center items-center min-h-[200px]">
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  const showAll = activeFilter === "All";
  const visibleComponents = showAll
    ? enabledComponents
    : enabledComponents.filter((c) => c.name === activeFilter);

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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">TOTAL STUDENTS</p>
            <p className="text-3xl font-semibold mt-2">
              {analyticsData?.totalStudents || rows.length || 0}
            </p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">SUBGROUPS</p>
            <p className="text-3xl font-semibold mt-2">
              {analyticsData?.subgroupCount ||
                new Set(rows.map((r) => String(r.Subgroup || "").trim()).filter(Boolean))
                  .size ||
                0}
            </p>
          </div>
          <div className="p-5 bg-white border rounded shadow-sm">
            <p className="text-sm text-gray-500">BRANCHES</p>
            <p className="text-3xl font-semibold mt-2">
              {analyticsData?.branchCount ||
                new Set(rows.map((r) => String(r.Branch || "").trim()).filter(Boolean))
                  .size ||
                0}
            </p>
          </div>
        </div>

        {/* Management cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Assign Faculty */}
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
                  <label className="block text-sm text-gray-700 mb-1">Choose Faculty</label>
                  <select
                    value={pendingFaculty}
                    onChange={(e) => setPendingFaculty(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">Assign Subgroup</label>
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
                      key={`${a.faculty._id}-${a.subgroup}-${i}`}
                      className="text-sm bg-gray-50 border rounded px-2 py-1"
                    >
                      <span className="font-medium">{a.faculty.name}</span>{" "}
                      <span className="text-gray-500">→ Subgroup</span>{" "}
                      <span className="font-medium">{a.subgroup}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Enter Components */}
          <div className="p-5 bg-white border rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Enter Components</h3>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => setShowAddComp(true)}
              >
                + Add
              </button>
            </div>

            {showAddComp && (
              <div className="mb-3 p-3 bg-blue-50 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Component</label>
                    <input
                      list="component-suggestions"
                      className="border rounded px-3 py-2 w-full"
                      placeholder="e.g., Project"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                    />
                    <datalist id="component-suggestions">
                      {commons.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Max Marks</label>
                    <input
                      type="number"
                      min="0"
                      className="border rounded px-3 py-2 w-full"
                      placeholder="e.g., 30"
                      value={compMarks}
                      onChange={(e) => setCompMarks(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleSaveComponent}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddComp(false);
                      setCompName("");
                      setCompMarks("");
                    }}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {enabledComponents.length === 0 ? (
              <p className="text-sm text-gray-400">No components added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {enabledComponents.map((c) => (
                  <span
                    key={c.name}
                    className="text-sm bg-gray-50 border rounded px-2 py-1"
                    title={`Max: ${c.maxMarks}`}
                  >
                    {c.name} · {c.maxMarks}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* COs */}
          <div className="p-5 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Course Objectives</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCO}
                onChange={(e) => setNewCO(e.target.value)}
                placeholder="Enter course objective"
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={handleAddCO}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {courseOutcomes?.length > 0 ? (
              <ul className="mt-3 list-decimal list-inside space-y-1 text-sm">
                {courseOutcomes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-400">No COs added yet.</p>
            )}
          </div>
        </div>

        {/* Excel actions */}
        <div className="flex flex-wrap gap-3 mb-4">
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
              Roll No., Name, Subgroup, Branch
              {enabledComponents.length > 0 && ", "}
              {enabledComponents.map((c) => c.name).join(", ")}
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
                  {visibleComponents.map((c) => (
                    <th key={c.name} className="p-2 border">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border">{r["Roll No."] || ""}</td>
                    <td className="p-2 border">{r["Name"] || ""}</td>
                    <td className="p-2 border">{r["Subgroup"] || ""}</td>
                    <td className="p-2 border">{r["Branch"] || ""}</td>
                    {visibleComponents.map((c) => (
                      <td key={c.name} className="p-2 border">
                        {r[c.name] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="p-4 text-center text-gray-500 border"
                      colSpan={4 + visibleComponents.length}
                    >
                      No data. Upload an Excel file using the current template.
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
