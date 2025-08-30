import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Sidebar from "./components/Sidebar";
import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";
import SubjectDetail from "./components/SubjectDetail";
import StudentReport from "./pages/StudentReport";

// 🔥 FIXED: Added 'user' prop to AppLayout
const AppLayout = ({ handleLogout, subjects, handleShowAddSubject, onRefreshSubjects, user }) => (
  <>
    <Sidebar 
      subjects={subjects} 
      onAddSubject={handleShowAddSubject} 
      onRefreshSubjects={onRefreshSubjects}
      user={user} // 🔥 Now user is properly passed
    />
    <main className="ml-64">
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
      <div className="p-8">
        <Outlet />
      </div>
    </main>
  </>
);

const FacultyLayout = ({ handleLogout }) => (
  <main>
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-blue-600">Greenbit Solutions</a>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
    <div className="py-6">
      <Outlet />
    </div>
  </main>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState({ name: "", code: "", semester: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // 🔥 ENHANCED: Better refresh subjects function
  const refreshSubjects = async () => {
    if (isRefreshing) return;
    
    console.log('🔄 Refreshing subjects and student data...');
    setIsRefreshing(true);
    
    try {
      await loadSubjectsFromBackend();
      setRefreshTrigger(prev => prev + 1);
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🔥 NEW: Force refresh all data (for after uploads)
  const forceRefreshAllData = async () => {
    console.log('🔄 Force refreshing all application data...');
    setIsRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadSubjectsFromBackend();
      setRefreshTrigger(prev => prev + 1);
      console.log('✅ Force refresh completed');
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
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

  // 🔥 ENHANCED: Load subjects with better error handling
  const loadSubjectsFromBackend = async (token = null) => {
    try {
      const authToken = token || localStorage.getItem("authToken");
      if (!authToken || !isTokenValid(authToken)) {
        clearAuth();
        return;
      }

      console.log('📡 Loading subjects from backend...');
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
          components: s.components || [],
          courseOutcomes: s.courseOutcomes || [],
          coordinator: s.coordinator || null,
        }));
        
        setSubjects(transformed);
        console.log('✅ Subjects loaded:', transformed.length, 'subjects');
      }
    } catch (err) {
      console.error("❌ Load subjects error:", err);
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

  // Add subject (coordinator)
  const handleAddSubject = async () => {
    if (!subjectInputs.name.trim() || !subjectInputs.code.trim() || !subjectInputs.semester.trim()) {
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
        components: saved.components || [],
        courseOutcomes: saved.courseOutcomes || [],
        coordinator: saved.coordinator || null,
      };
      setSubjects((prev) => [...prev, transformed]);
      setShowAddSubjectModal(false);
      setSubjectInputs({ name: "", code: "", semester: "" });
      alert("Subject created successfully!");
      
      setTimeout(refreshSubjects, 500);
    }
  };

  // 🔥 ENHANCED: Update subject with better refresh
  const handleUpdateSubject = async (updated, index) => {
    console.log('📝 Updating subject at index:', index);
    const next = [...subjects];
    next[index] = updated;
    setSubjects(next);
    
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      forceRefreshAllData();
    }, 500);
  };

  // Remove subject by ID
  const handleRemoveSubject = async (subjectId) => {
    console.log('🗑️ Removing subject with ID:', subjectId);
    setSubjects((prevSubjects) => {
      const filtered = prevSubjects.filter(subject => subject._id !== subjectId);
      console.log('✅ Subjects after removal:', filtered.length);
      return filtered;
    });

    setTimeout(refreshSubjects, 1000);
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
      <Register onRegister={handleRegister} switchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} switchToRegister={() => setShowRegister(true)} />
    );
  }

  // Main authenticated app
  return (
    <BrowserRouter>
      {/* 🔥 NEW: Global refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-[9999] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Syncing data...</span>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Add Subject</h2>
            <div className="space-y-4">
              {["name", "code", "semester"].map((f) => (
                <div key={f} className="flex flex-col">
                  <label className="text-left font-semibold text-blue-700 mb-1">
                    {f === "name" ? "Subject Name" : f === "code" ? "Subject Code" : "Semester"}
                  </label>
                  <input
                    type="text"
                    name={f}
                    value={subjectInputs[f]}
                    onChange={(e) => setSubjectInputs((prev) => ({ ...prev, [f]: e.target.value }))}
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
        {/* Subject detail */}
        <Route
          path="/subject/:idx"
          element={
            <>
              <Sidebar
                subjects={subjects}
                onAddSubject={() => setShowAddSubjectModal(true)}
                onRemoveSubject={handleRemoveSubject}
                user={user}
                onRefreshSubjects={refreshSubjects}
              />
              <SubjectDetail 
                subjects={subjects} 
                user={user} 
                onUpdateSubject={handleUpdateSubject}
                onRefreshSubjects={forceRefreshAllData}
              />
            </>
          }
        />
        {/* Report page */}
        <Route
          path="/subject/:idx/report"
          element={
            <>
              <Sidebar
                subjects={subjects}
                onAddSubject={() => setShowAddSubjectModal(true)}
                onRemoveSubject={handleRemoveSubject}
                user={user}
                onRefreshSubjects={refreshSubjects}
              />
              <StudentReport 
                subjects={subjects} 
                user={user} 
                onRefreshSubjects={refreshSubjects}
              />
            </>
          }
        />

        {/* Root route */}
        <Route
          path="/"
          element={
            user?.role === "coordinator" ? (
              <AppLayout
                handleLogout={handleLogout}
                subjects={subjects}
                handleShowAddSubject={() => setShowAddSubjectModal(true)}
                onRefreshSubjects={refreshSubjects}
                user={user} // 🔥 FIXED: Now passing user prop
              />
            ) : (
              <FacultyLayout handleLogout={handleLogout} />
            )
          }
        >
          <Route
            index
            element={
              user?.role === "coordinator" ? (
                <CoordinatorLanding 
                  subjects={subjects} 
                  onRemoveSubject={handleRemoveSubject}
                  onRefreshSubjects={refreshSubjects}
                />
              ) : (
                <FacultyLanding 
                  user={user} 
                  subjects={subjects} 
                  onRefreshSubjects={refreshSubjects}
                  refreshTrigger={refreshTrigger}
                  isRefreshing={isRefreshing}
                />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
