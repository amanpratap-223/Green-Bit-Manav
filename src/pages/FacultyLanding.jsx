import React from "react";
import Sidebar from "../components/Sidebar";

export default function FacultyLanding({ onLogout, user }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold">Faculty Landing Page</h1>
        <p>Welcome, {user?.name} ({user?.email})</p>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-full mt-4 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </main>
    </div>
  );
}
