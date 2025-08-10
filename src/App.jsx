

// src/App.jsx
import React from "react";
import Login from "./components/Login";
import Register from "./components/Register";

import CoordinatorLanding from "./pages/CoordinatorLanding";
import FacultyLanding from "./pages/FacultyLanding";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [showRegister, setShowRegister] = React.useState(false);

  // load previous session
  React.useEffect(() => {
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

  // 1) Show Register
  if (!isAuthenticated && showRegister) {
    return <Register onRegister={handleRegister} switchToLogin={switchToLogin} />;
  }

  // 2) Show Login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} switchToRegister={switchToRegister} />;
  }

  // 3) Authenticated — land by role
  if (user?.role === "coordinator") {
    return <CoordinatorLanding user={user} onLogout={handleLogout} />;
  }
  // default to faculty if not coordinator
  return <FacultyLanding user={user} onLogout={handleLogout} />;
}
