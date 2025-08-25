// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";
import Sidebar from "./components/Sidebar";
import SubjectDetail from "./components/SubjectDetail";
import StudentReport from "./pages/StudentReport";

// Layout wrapper (Sidebar + Navbar)
const AppLayout = ({ handleLogout, subjects, handleShowAddSubject }) => (
  <>
    <Sidebar subjects={subjects} onAddSubject={handleShowAddSubject} />
    <main className="ml-64">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex justify-between items-center px-8 py-4">
          <a
            href="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-800"
          >
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

      {/* Routed children */}
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
  const [isLoading, setIsLoading] = useState(true);

  // Validate JWT expiry
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Clear auth data
  const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setSubjects([]);
  };

  // Init on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        if (!isTokenValid(token)) {
          clearAuth();
          setIsLoading(false);
          return;
        }

        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          await loadSubjectsFromBackend(token);
        } catch (err) {
          console.error("Init error:", err);
          clearAuth();
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Load subjects
  const loadSubjectsFromBackend = async (token = null) => {
    try {
      const authToken = token || localStorage.getItem("authToken");
      if (!authToken || !isTokenValid(authToken)) {
        clearAuth();
        return;
      }

      const res = await fetch("http://localhost:5000/api/subjects", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        clearAuth();
        return;
      }

      const data = await res.json();
      if (data.success) {
        const transformed = data.data.map((s) => ({
          name: s.name,
          code: s.code,
          semester: s.semester,
          courseObjectives: s.courseObjectives || [],
          students: [],
          _id: s._id,
          totalStudents: s.totalStudents || 0,
          facultyAssignments: s.facultyAssignments || [],
          components: s.components || [], // ✅ dynamic assessment components
          courseOutcomes: s.courseOutcomes || [],
        }));
        setSubjects(transformed);
      }
    } catch (err) {
      console.error("Load subjects error:", err);
    }
  };

  // Save subject
  const saveSubjectToBackend = async (subjectData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !isTokenValid(token)) {
        clearAuth();
        throw new Error("Authentication required.");
      }

      const res = await fetch("http://localhost:5000/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subjectData),
      });

      if (res.status === 401) {
        clearAuth();
        throw new Error("Session expired.");
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.error("Save subject error:", err);
      alert(err.message);
      return null;
    }
  };

  // Add subject modal
  const handleAddSubject = async () => {
    if (
      !subjectInputs.name.trim() ||
      !subjectInputs.code.trim() ||
      !subjectInputs.semester.trim()
    ) {
      alert("All fields are required!");
      return;
    }

    const saved = await saveSubjectToBackend({
      name: subjectInputs.name.trim(),
      code: subjectInputs.code.trim(),
      semester: subjectInputs.semester.trim(),
    });

    if (saved) {
      const transformed = {
        name: saved.name,
        code: saved.code,
        semester: saved.semester,
        courseObjectives: saved.courseObjectives || [],
        students: [],
        _id: saved._id,
        totalStudents: saved.totalStudents || 0,
        facultyAssignments: saved.facultyAssignments || [],
        components: saved.components || [], // ✅ new
        courseOutcomes: saved.courseOutcomes || [],
      };
      setSubjects((prev) => [...prev, transformed]);
      setShowAddSubjectModal(false);
      setSubjectInputs({ name: "", code: "", semester: "" });
      alert("Subject created successfully!");
    }
  };

  // Update subject
  const handleUpdateSubject = (updated, index) => {
    const next = [...subjects];
    next[index] = updated;
    setSubjects(next);
  };

  // Auth handlers
  const handleLogin = (u) => {
    setIsAuthenticated(true);
    setUser(u);
    loadSubjectsFromBackend();
  };
  const handleRegister = (u) => {
    setIsAuthenticated(true);
    setUser(u);
    loadSubjectsFromBackend();
  };
  const handleLogout = () => {
    clearAuth();
    setShowRegister(false);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated views
  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        switchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        switchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Main authenticated app
  return (
    <BrowserRouter>
      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Add Subject</h2>
            <div className="space-y-4">
              {["name", "code", "semester"].map((f) => (
                <div key={f} className="flex flex-col">
                  <label className="text-left font-semibold text-blue-700 mb-1">
                    {f === "name"
                      ? "Subject Name"
                      : f === "code"
                      ? "Subject Code"
                      : "Semester"}
                  </label>
                  <input
                    type="text"
                    name={f}
                    value={subjectInputs[f]}
                    onChange={(e) =>
                      setSubjectInputs((prev) => ({ ...prev, [f]: e.target.value }))
                    }
                    placeholder={f}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      <Routes>
        {/* Subject Detail */}
        <Route
          path="/subject/:idx"
          element={
            <>
              <Sidebar
                subjects={subjects}
                onAddSubject={() => setShowAddSubjectModal(true)}
              />
              <SubjectDetail
                subjects={subjects}
                user={user}
                onUpdateSubject={handleUpdateSubject}
              />
            </>
          }
        />

        {/* Report */}
        <Route
          path="/subject/:idx/report"
          element={
            <>
              <Sidebar
                subjects={subjects}
                onAddSubject={() => setShowAddSubjectModal(true)}
              />
              <StudentReport subjects={subjects} />
            </>
          }
        />

        {/* Dashboard landing */}
        <Route
          path="/*"
          element={
            <AppLayout
              handleLogout={handleLogout}
              subjects={subjects}
              handleShowAddSubject={() => setShowAddSubjectModal(true)}
            >
              <Routes>
                {user?.role === "coordinator" && (
                  <Route
                    path="/"
                    element={<CoordinatorLanding subjects={subjects} />}
                  />
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
