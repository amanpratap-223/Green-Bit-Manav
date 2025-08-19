// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import CoordinatorLanding from "./pages/CoordinatorLanding";
// import FacultyLanding from "./pages/FacultyLanding";
// import Sidebar from "./components/Sidebar";
// import SubjectDetail from "./components/SubjectDetail";

// // A layout component to keep the Sidebar and Navbar persistent
// const AppLayout = ({ handleLogout, subjects, handleShowAddSubject }) => (
//   <>
//     <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
//     <main className="ml-64"> {/* Offset content for the sidebar width */}
//       {/* Navbar restored to original design */}
//       <header className="bg-white shadow-sm border-b sticky top-0 z-40">
//         <div className="flex justify-between items-center px-8 py-4">
//           <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
//             Greenbit Solutions
//           </a>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* Main content area */}
//       <div className="p-8">
//         <Outlet />
//       </div>
//     </main>
//   </>
// );

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [showRegister, setShowRegister] = useState(false);
//   const [subjects, setSubjects] = useState([]);
//   const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
//   const [subjectInputs, setSubjectInputs] = useState({ name: "", code: "", semester: "" });

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     const storedUser = localStorage.getItem("user");
//     if (token && storedUser) {
//       setIsAuthenticated(true);
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Modal handlers
//   function handleShowAddSubject() {
//     setShowAddSubjectModal(true);
//   }

//   function handleAddSubject() {
//     if (!subjectInputs.name.trim() || !subjectInputs.code.trim() || !subjectInputs.semester.trim()) {
//       alert("All fields are required!");
//       return;
//     }
//     const newSubject = {
//       name: subjectInputs.name.trim(),
//       code: subjectInputs.code.trim(),
//       semester: subjectInputs.semester.trim(),
//       // ✨ EACH new subject now gets its own objectives and students list
//       courseObjectives: [],
//       students: [],
//     };
//     setSubjects((prev) => [...prev, newSubject]);
//     setShowAddSubjectModal(false);
//     setSubjectInputs({ name: "", code: "", semester: "" });
//   }

//   // ✨ NEW function to update a subject's data from a child component
//   function handleUpdateSubject(updatedSubject, index) {
//     const newSubjects = [...subjects];
//     newSubjects[index] = updatedSubject;
//     setSubjects(newSubjects);
//   }

//   function handleCancelAddSubject() {
//     setShowAddSubjectModal(false);
//   }

//   function handleSubjectInputChange(e) {
//     const { name, value } = e.target;
//     setSubjectInputs((prev) => ({ ...prev, [name]: value }));
//   }

//   // Authentication handlers
//   const handleLogin = (userData) => {
//     setIsAuthenticated(true);
//     setUser(userData);
//     setShowRegister(false);
//   };
//   const handleRegister = (userData) => {
//     setIsAuthenticated(true);
//     setUser(userData);
//     setShowRegister(false);
//   };
//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     setIsAuthenticated(false);
//     setUser(null);
//     setShowRegister(false);
//   };
//   const switchToRegister = () => setShowRegister(true);
//   const switchToLogin = () => setShowRegister(false);

//   // Show Register or Login if not authenticated
//   if (!isAuthenticated) {
//     return showRegister ? (
//       <Register onRegister={handleRegister} switchToLogin={switchToLogin} />
//     ) : (
//       <Login onLogin={handleLogin} switchToRegister={switchToRegister} />
//     );
//   }

//   // Main application
//   return (
//     <BrowserRouter>
//       {/* Modal: Add Subject */}
//       {showAddSubjectModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
//           <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative">
//             <h2 className="text-xl font-bold mb-4 text-center">Add Subject</h2>
//             <div className="space-y-4">
//               {[
//                 { label: "Subject Name", name: "name" },
//                 { label: "Subject Code", name: "code" },
//                 { label: "Semester", name: "semester" },
//               ].map(({ label, name }) => (
//                 <div key={name} className="flex flex-col">
//                   <label className="text-left font-semibold text-blue-700 mb-1">{label}</label>
//                   <input
//                     type="text"
//                     name={name}
//                     value={subjectInputs[name]}
//                     onChange={handleSubjectInputChange}
//                     placeholder={label}
//                     className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={handleAddSubject}
//               className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-md py-2 hover:bg-blue-700 transition"
//             >
//               Create
//             </button>
//             <button
//               onClick={handleCancelAddSubject}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
//               title="Close"
//             >
//               &#10005;
//             </button>
//           </div>
//         </div>
//       )}

//       <Routes>
//         <Route
//           path="/subject/:idx"
//           element={
//             <>
//               <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
//               <SubjectDetail
//                 subjects={subjects}
//                 user={user}
//                 onUpdateSubject={handleUpdateSubject} // ✨ Pass the update function as a prop
//               />
//             </>
//           }
//         />

//         <Route
//           path="/*"
//           element={
//             <AppLayout
//               handleLogout={handleLogout}
//               subjects={subjects}
//               handleShowAddSubject={handleShowAddSubject}
//             >
//               <Routes>
//                 {user?.role === "coordinator" && (
//                   <Route path="/" element={<CoordinatorLanding subjects={subjects} />} />
//                 )}
//                 {user?.role !== "coordinator" && (
//                   <Route path="/" element={<FacultyLanding user={user} />} />
//                 )}
//               </Routes>
//             </AppLayout>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }


import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";
import Sidebar from "./components/Sidebar";
import SubjectDetail from "./components/SubjectDetail";
import StudentReport from "./pages/StudentReport"; // ✅ NEW

// Layout component that keeps Sidebar + Navbar persistent
const AppLayout = ({ handleLogout, subjects, handleShowAddSubject }) => (
  <>
    <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
    <main className="ml-64">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex justify-between items-center px-8 py-4">
          <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
            Greenbit Solutions
          </a>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Routed content */}
      <div className="p-8">
        <Outlet />
      </div>
    </main>
  </>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState({
    name: "",
    code: "",
    semester: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Modal handlers
  function handleShowAddSubject() {
    setShowAddSubjectModal(true);
  }

  function handleAddSubject() {
    if (
      !subjectInputs.name.trim() ||
      !subjectInputs.code.trim() ||
      !subjectInputs.semester.trim()
    ) {
      alert("All fields are required!");
      return;
    }
    const newSubject = {
      name: subjectInputs.name.trim(),
      code: subjectInputs.code.trim(),
      semester: subjectInputs.semester.trim(),
      courseObjectives: [],
      students: [],
    };
    setSubjects((prev) => [...prev, newSubject]);
    setShowAddSubjectModal(false);
    setSubjectInputs({ name: "", code: "", semester: "" });
  }

  // Update a subject (used by SubjectDetail)
  function handleUpdateSubject(updatedSubject, index) {
    const newSubjects = [...subjects];
    newSubjects[index] = updatedSubject;
    setSubjects(newSubjects);
  }

  function handleCancelAddSubject() {
    setShowAddSubjectModal(false);
  }

  function handleSubjectInputChange(e) {
    const { name, value } = e.target;
    setSubjectInputs((prev) => ({ ...prev, [name]: value }));
  }

  // Auth handlers
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowRegister(false);
  };
  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowRegister(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setShowRegister(false);
  };
  const switchToRegister = () => setShowRegister(true);
  const switchToLogin = () => setShowRegister(false);

  // Unauth views
  if (!isAuthenticated) {
    return showRegister ? (
      <Register onRegister={handleRegister} switchToLogin={switchToLogin} />
    ) : (
      <Login onLogin={handleLogin} switchToRegister={switchToRegister} />
    );
  }

  // Main application
  return (
    <BrowserRouter>
      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Add Subject</h2>
            <div className="space-y-4">
              {[
                { label: "Subject Name", name: "name" },
                { label: "Subject Code", name: "code" },
                { label: "Semester", name: "semester" },
              ].map(({ label, name }) => (
                <div key={name} className="flex flex-col">
                  <label className="text-left font-semibold text-blue-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={subjectInputs[name]}
                    onChange={handleSubjectInputChange}
                    placeholder={label}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAddSubject}
              className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-md py-2 hover:bg-blue-700 transition"
            >
              Create
            </button>
            <button
              onClick={handleCancelAddSubject}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              title="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      <Routes>
        {/* Subject details */}
        <Route
          path="/subject/:idx"
          element={
            <>
              <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
              <SubjectDetail
                subjects={subjects}
                user={user}
                onUpdateSubject={handleUpdateSubject}
              />
            </>
          }
        />

        {/* ✅ NEW: Subject report (after Excel upload) */}
        <Route
          path="/subject/:idx/report"
          element={
            <>
              <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
              <StudentReport subjects={subjects} />
            </>
          }
        />

        {/* App layout with dashboard landing routes */}
        <Route
          path="/*"
          element={
            <AppLayout
              handleLogout={handleLogout}
              subjects={subjects}
              handleShowAddSubject={handleShowAddSubject}
            >
              {/* NOTE: AppLayout uses <Outlet/>, but to keep your existing structure
                  we still render the child dashboard routes below */}
              <Routes>
                {user?.role === "coordinator" && (
                  <Route path="/" element={<CoordinatorLanding subjects={subjects} />} />
                )}
                {user?.role !== "coordinator" && (
                  <Route path="/" element={<FacultyLanding user={user} />} />
                )}
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
