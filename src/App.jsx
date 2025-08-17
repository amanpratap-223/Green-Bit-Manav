import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";
import Sidebar from "./components/Sidebar";
import SubjectDetail from "./components/SubjectDetail";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState({ name: "", code: "", semester: "" });

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  // Modal handlers
  function handleShowAddSubject() {
    setShowAddSubjectModal(true);
    setSubjectInputs({ name: "", code: "", semester: "" });
  }
  function handleAddSubject() {
    if (!subjectInputs.name.trim() || !subjectInputs.code.trim() || !subjectInputs.semester.trim()) {
      alert("All fields required!");
      return;
    }
    setSubjects(prev => [
      ...prev,
      {
        name: subjectInputs.name.trim(),
        code: subjectInputs.code.trim(),
        semester: subjectInputs.semester.trim(),
      }
    ]);
    setShowAddSubjectModal(false);
    setSubjectInputs({ name: "", code: "", semester: "" });
  }
  function handleCancelAddSubject() {
    setShowAddSubjectModal(false);
  }
  function handleSubjectInputChange(e) {
    const { name, value } = e.target;
    setSubjectInputs(prev => ({ ...prev, [name]: value }));
  }

  // Show Register
  if (!isAuthenticated && showRegister) {
    return <Register onRegister={handleRegister} switchToLogin={switchToLogin} />;
  }
  // Show Login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} switchToRegister={switchToRegister} />;
  }

  // Main content
  return (
    <BrowserRouter>
      <Sidebar
        subjects={subjects}
        onAddSubject={handleShowAddSubject}
        selectedSubjectIndex={selectedSubjectIndex}
        setSelectedSubjectIndex={setSelectedSubjectIndex}
      />
      {/* Modal: Add Subject */}
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
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
              title="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/subject/:idx" element={
          <SubjectDetail subjects={subjects} />
        } />
        {user?.role === "coordinator" && (
          <Route path="/" element={<CoordinatorLanding user={user} onLogout={handleLogout} />} />
        )}
        {user?.role !== "coordinator" && (
          <Route path="/" element={<FacultyLanding user={user} onLogout={handleLogout} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
