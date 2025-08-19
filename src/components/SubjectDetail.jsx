// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import * as XLSX from "xlsx";

// // ✨ Accept the new onUpdateSubject prop
// export default function SubjectDetail({ subjects, user, onUpdateSubject }) {
//   const { idx } = useParams();
//   const subject = subjects[idx];

//   const [newObjective, setNewObjective] = useState("");
//   // ❌ REMOVED the local state for courseObjectives and students

//   if (!subject) {
//     return (
//       <div className="p-6 text-center text-red-500">Subject not found.</div>
//     );
//   }

//   // ✨ UPDATED to modify the main subjects array in App.jsx
//   const handleAddObjective = () => {
//     if (!newObjective.trim()) return;
//     const newObjectives = [...(subject.courseObjectives || []), newObjective.trim()];
//     const updatedSubject = { ...subject, courseObjectives: newObjectives };
//     onUpdateSubject(updatedSubject, idx); // Send the updated subject back to App.jsx
//     setNewObjective("");
//   };

//   const handleDownloadTemplate = () => {
//     const worksheet = XLSX.utils.json_to_sheet([
//       { "Roll No.": "", Name: "", Subgroup: "", Branch: "" },
//     ]);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, worksheet, "StudentsTemplate");
//     XLSX.writeFile(wb, `${subject.code}_StudentsTemplate.xlsx`);
//   };

//   // ✨ UPDATED to modify the main subjects array in App.jsx
//   const handleUploadStudents = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const wb = XLSX.read(data, { type: "array" });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(ws);
//       const updatedSubject = { ...subject, students: jsonData };
//       onUpdateSubject(updatedSubject, idx); // Send the updated subject back to App.jsx
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   return (
//     <div className="pl-72 pt-8 pr-8 pb-10">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <h1 className="text-2xl font-bold text-blue-800 mb-4">
//           {subject.name} ({subject.code})
//         </h1>
//         <p className="text-gray-600 mb-6">
//           Semester: <span className="font-semibold">{subject.semester}</span>
//         </p>

//         {/* Course Objectives */}
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-3">
//             Course Objectives
//           </h2>
//           {user?.role === "coordinator" && (
//             <div className="flex gap-2 mb-3">
//               <input
//                 type="text"
//                 className="border rounded px-3 py-2 flex-1"
//                 placeholder="Enter course objective"
//                 value={newObjective}
//                 onChange={(e) => setNewObjective(e.target.value)}
//               />
//               <button
//                 onClick={handleAddObjective}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           {/* ✨ Now reads directly from the subject prop */}
//           <ul className="list-decimal list-inside space-y-1 text-gray-800">
//             {(subject.courseObjectives || []).map((obj, i) => (
//               <li key={i}>{obj}</li>
//             ))}
//           </ul>
//         </div>

//         {/* Student Management */}
//         <div>
//           <h2 className="text-xl font-semibold text-gray-700 mb-3">Students</h2>
//           {user?.role === "coordinator" && (
//             <div className="flex gap-3 mb-4">
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//               >
//                 Download Template
//               </button>
//               <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700">
//                 Upload Student Excel
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls"
//                   onChange={handleUploadStudents}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//           )}

//           {/* ✨ Now reads directly from the subject prop */}
//           {(subject.students || []).length > 0 && (
//             <table className="w-full border border-gray-300 rounded-lg text-sm">
//               <thead>
//                 <tr className="bg-gray-100 text-left">
//                   <th className="p-2 border">Roll No.</th>
//                   <th className="p-2 border">Name</th>
//                   <th className="p-2 border">Subgroup</th>
//                   <th className="p-2 border">Branch</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {subject.students.map((s, i) => (
//                   <tr key={i} className="hover:bg-gray-50">
//                     <td className="p-2 border">{s["Roll No."]}</td>
//                     <td className="p-2 border">{s["Name"]}</td>
//                     <td className="p-2 border">{s["Subgroup"]}</td>
//                     <td className="p-2 border">{s["Branch"]}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/SubjectDetail.jsx
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

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    const newObjectives = [...(subject.courseObjectives || []), newObjective.trim()];
    const updatedSubject = { ...subject, courseObjectives: newObjectives };
    onUpdateSubject(updatedSubject, idx);
    setNewObjective("");
  };

  // ✅ Template now includes MST, EST, Sessional, Lab
  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Roll No.": "",
        Name: "",
        Subgroup: "",
        Branch: "",
        MST: "",         // Mid-sem test
        EST: "",         // End-sem test
        Sessional: "",   // Internal/continuous
        Lab: "",         // Lab marks
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "StudentsTemplate");
    XLSX.writeFile(wb, `${subject.code}_StudentsTemplate.xlsx`);
  };

  // ✅ Parse Excel and redirect to report page
  const handleUploadStudents = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const updatedSubject = {
        ...subject,
        students: jsonData, // keep as-is so column headers remain usable
      };
      onUpdateSubject(updatedSubject, idx);

      // ➜ Go to the report page
      navigate(`/subject/${idx}/report`);
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

          {(subject.students || []).length > 0 && (
            <div className="text-sm text-gray-600">
              <p>Uploaded: {(subject.students || []).length} rows.</p>
              <button
                onClick={() => navigate(`/subject/${idx}/report`)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
