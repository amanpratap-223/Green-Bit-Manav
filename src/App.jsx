import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";
import Sidebar from "./components/Sidebar";
import SubjectDetail from "./components/SubjectDetail";
import StudentReport from "./pages/StudentReport";

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
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  // Clear invalid authentication
  const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setSubjects([]);
  };

  // Check authentication and load subjects on mount
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        // Validate token before proceeding
        if (!isTokenValid(token)) {
          console.log("Token expired, clearing auth data");
          clearAuth();
          setIsLoading(false);
          return;
        }

        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Load subjects from backend
          await loadSubjectsFromBackend(token);
        } catch (error) {
          console.error("Error initializing app:", error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Function to load subjects from backend
  const loadSubjectsFromBackend = async (token = null) => {
    try {
      const authToken = token || localStorage.getItem("authToken");
      if (!authToken || !isTokenValid(authToken)) {
        clearAuth();
        return;
      }

      const response = await fetch("http://localhost:5000/api/subjects", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        console.log("Unauthorized - clearing auth data");
        clearAuth();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedSubjects = data.data.map(subject => ({
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          courseObjectives: subject.courseObjectives || [],
          students: [], // Will be loaded separately when needed
          _id: subject._id, // Keep the MongoDB ID for API calls
          totalStudents: subject.totalStudents || 0,
          facultyAssignments: subject.facultyAssignments || [],
          weightage: subject.weightage || { MST: 0, EST: 0, Sessional: 0, Lab: 0 },
          courseOutcomes: subject.courseOutcomes || []
        }));
        setSubjects(transformedSubjects);
      } else {
        console.error("Failed to load subjects:", data.message);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        clearAuth();
      }
    }
  };

  // Function to save subject to backend
  const saveSubjectToBackend = async (subjectData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !isTokenValid(token)) {
        clearAuth();
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch("http://localhost:5000/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(subjectData)
      });

      if (response.status === 401) {
        clearAuth();
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error saving subject:", error);
      
      if (error.message.includes("Authentication required") || 
          error.message.includes("Session expired")) {
        alert(error.message);
      } else if (error.message === "Failed to fetch") {
        alert("Unable to connect to server. Please check if the backend is running.");
      } else {
        alert("Error saving subject: " + error.message);
      }
      return null;
    }
  };

  // Modal handlers
  function handleShowAddSubject() {
    setShowAddSubjectModal(true);
  }

  const handleAddSubject = async () => {
    if (
      !subjectInputs.name.trim() ||
      !subjectInputs.code.trim() ||
      !subjectInputs.semester.trim()
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      const savedSubject = await saveSubjectToBackend({
        name: subjectInputs.name.trim(),
        code: subjectInputs.code.trim(),
        semester: subjectInputs.semester.trim()
      });

      if (savedSubject) {
        // Transform and add to local state
        const transformedSubject = {
          name: savedSubject.name,
          code: savedSubject.code,
          semester: savedSubject.semester,
          courseObjectives: savedSubject.courseObjectives || [],
          students: [],
          _id: savedSubject._id,
          totalStudents: savedSubject.totalStudents || 0,
          facultyAssignments: savedSubject.facultyAssignments || [],
          weightage: savedSubject.weightage || { MST: 0, EST: 0, Sessional: 0, Lab: 0 },
          courseOutcomes: savedSubject.courseOutcomes || []
        };

        setSubjects(prev => [...prev, transformedSubject]);
        setShowAddSubjectModal(false);
        setSubjectInputs({ name: "", code: "", semester: "" });
        alert("Subject created successfully!");
      }
    } catch (error) {
      console.error("Error in handleAddSubject:", error);
      // Error already handled in saveSubjectToBackend
    }
  };

  // Update a subject (used by SubjectDetail)
  function handleUpdateSubject(updatedSubject, index) {
    const newSubjects = [...subjects];
    newSubjects[index] = updatedSubject;
    setSubjects(newSubjects);
  }

  function handleCancelAddSubject() {
    setShowAddSubjectModal(false);
    setSubjectInputs({ name: "", code: "", semester: "" });
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
    // Load subjects after login
    loadSubjectsFromBackend();
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowRegister(false);
    // Load subjects after register
    loadSubjectsFromBackend();
  };

  const handleLogout = () => {
    clearAuth();
    setShowRegister(false);
  };

  const switchToRegister = () => setShowRegister(true);
  const switchToLogin = () => setShowRegister(false);

  // Show loading while initializing
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

        {/* Subject report (after Excel upload) */}
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
