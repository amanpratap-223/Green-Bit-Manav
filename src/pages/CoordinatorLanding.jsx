// CoordinatorLanding.jsx (sample structure)
import React from "react";
import Sidebar from "../components/Sidebar";
import CoordinatorNavbar from "../components/CoordinatorNavbar";
export default function CoordinatorLanding({ onLogout, user }) {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <CoordinatorNavbar onLogout={onLogout} />
        {/* main content goes here */}
      </div>
      {/* Modal should NOT cover CoordinatorNavbar */}
    </div>
  );
}
