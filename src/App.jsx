import React, { useState } from "react";
import COTable from "./components/CoTable";
import COAnalyticsTable from "./components/COAnalyticsTable";
import CourseInfoForm from "./components/CourseInfoForm";
import Login from "./components/Login";
import Register from "./components/Register"; // ADD THIS IMPORT
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
  CourseCodeDropdown
} from "./components/AceternityNavbar";

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false); // ADD THIS STATE

  const [refreshAnalytics, setRefreshAnalytics] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [coColumns, setCoColumns] = useState([
    "CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8"
  ]);

  const courseCodes = ["CS201", "CS202", "MA301", "EE405"];
  const [selectedCourse, setSelectedCourse] = useState(courseCodes[0]);

  const [courseInfo, setCourseInfo] = useState({
    courseTitle: "",
    instructor: "",
    session: "",
    totalStudents: ""
  });

  const navLinks = [
    { name: "Home", link: "/" },
    { name: "Matrix", link: "#matrix" },
    { name: "Analytics", link: "#analytics" }
  ];

  const handleMatrixSaved = () => setRefreshAnalytics(r => r + 1);

  // Authentication handlers
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowRegister(false); // Reset to login view
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowRegister(false); // Reset to login view
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowRegister(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Navigation between login and register
  const switchToRegister = () => setShowRegister(true);
  const switchToLogin = () => setShowRegister(false);

  // Update Course No. automatically on dropdown change
  React.useEffect(() => {
    setCourseInfo((prev) => ({
      ...prev,
      courseNo: selectedCourse
    }));
  }, [selectedCourse]);

  // Check for existing login on app start
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Show Register component if showRegister is true
  if (!isAuthenticated && showRegister) {
    return (
      <Register 
        onRegister={handleRegister} 
        switchToLogin={switchToLogin}
      />
    );
  }

  // Show Login component if not authenticated
  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin} 
        switchToRegister={switchToRegister}
      />
    );
  }

  // Show main application if authenticated
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navLinks} />
          <CourseCodeDropdown
            courseCodes={courseCodes}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            className="ml-4"
          />
          <NavbarButton 
            onClick={handleLogout} 
            className="ml-4 cursor-pointer"
          >
            Logout
          </NavbarButton>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
            {navLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 text-white block"
              >
                {item.name}
              </a>
            ))}
            <CourseCodeDropdown
              courseCodes={courseCodes}
              selectedCourse={selectedCourse}
              onCourseChange={setSelectedCourse}
              className="mt-2"
            />
            <NavbarButton 
              onClick={handleLogout} 
              className="w-full mt-2 cursor-pointer"
            >
              Logout
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      {/* Welcome message */}
      {user && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center">
          Welcome back, {user.name}!
        </div>
      )}
      
      <div className="flex flex-col items-center w-full px-2 pt-24">
        <h2 className="text-2xl font-bold text-white mb-4"></h2>
        <div className="flex flex-row gap-8 w-full justify-center">
          <CourseInfoForm
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            selectedCourse={selectedCourse}
          />
          <div id="analytics" className="flex-1">
            <COAnalyticsTable
              refreshTrigger={refreshAnalytics}
              coColumns={coColumns}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 mt-8"></h2>
        <div id="matrix" className="w-full flex justify-center">
          <COTable
            onMatrixSaved={handleMatrixSaved}
            coColumns={coColumns}
            setCoColumns={setCoColumns}
          />
        </div>
      </div>
    </div>
  );
}
