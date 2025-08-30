import React, { useState } from "react";
import {
  IconBook,
  IconPlus,
  IconHelp,
  IconSettings,
  IconChevronDown,
  IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const bottomItems = [
  { label: "Help & Support", icon: <IconHelp size={22} />, link: "#" },
  { label: "Settings", icon: <IconSettings size={22} />, link: "#" },
];

export default function Sidebar({ subjects = [], onAddSubject, onRemoveSubject, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [noSubjectPopup, setNoSubjectPopup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  function handleDropdownClick() {
    if (subjects.length === 0) {
      setNoSubjectPopup(true);
    } else {
      setDropdownOpen((d) => !d);
    }
  }

  function handleSubjectSelect(idx) {
    setDropdownOpen(false);
    navigate(`/subject/${idx}`);
  }

  const handleRemoveClick = (e, idx, subject) => {
    e.stopPropagation();
    console.log('Subject to delete:', subject);
    console.log('Subject ID:', subject._id);
    setConfirmDelete({ idx, subject });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    if (!confirmDelete.subject._id) {
      alert("Error: Subject ID is missing");
      setConfirmDelete(null);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/subjects/${confirmDelete.subject._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 FIXED: Pass subject ID instead of index
        onRemoveSubject(confirmDelete.subject._id);
        setDropdownOpen(false);
        alert("Subject and associated students deleted successfully!");
      } else {
        alert("Error deleting subject: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Error deleting subject: " + error.message);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-gradient-to-b from-blue-800 to-blue-500 shadow-xl z-50">
        {/* Logo and controls */}
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <span className="text-white text-2xl font-bold tracking-wider mb-1">
            Sidebar
          </span>
          <div className="w-full flex flex-col gap-1 items-center px-3">
            <div className="w-full">
              <button
                className="w-full flex items-center justify-between bg-blue-900/70 rounded-md px-4 py-2 text-white font-semibold hover:bg-blue-900 transition-colors"
                onClick={handleDropdownClick}
              >
                <span className="flex items-center gap-3">
                  <IconBook size={22} />
                  Subject
                </span>
                <IconChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {/* Dropdown list with improved styling */}
              {dropdownOpen && subjects.length > 0 && (
                <ul className="bg-blue-800 rounded-b-md shadow-lg mt-1 overflow-hidden">
                  {subjects.map((subj, idx) => (
                    <li key={subj._id || subj.code + idx} className="relative">
                      <button
                        className="w-full text-left px-4 py-2 text-white/90 hover:bg-blue-900/80 flex justify-between items-center"
                        onClick={() => handleSubjectSelect(idx)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{subj.name}</span>
                          <span className="text-blue-300 text-xs">
                            {subj.code}
                          </span>
                        </div>
                        {user?.role === "coordinator" && subj._id && (
                          <button
                            onClick={(e) => handleRemoveClick(e, idx, subj)}
                            className="ml-2 p-1 rounded hover:bg-red-600/80 text-red-300 hover:text-white transition-colors"
                            title="Delete subject"
                            disabled={isDeleting}
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-white hover:bg-blue-900/50 transition-colors"
              onClick={onAddSubject}
            >
              <IconPlus size={22} />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
        {/* Bottom Items */}
        <div className="mb-6 space-y-1 px-3">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-white hover:bg-blue-900/50 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Modal: No Subject Added notice */}
      {noSubjectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg max-w-xs w-full p-5 shadow-lg relative text-center">
            <h3 className="text-lg font-semibold mb-3">No Subjects Added</h3>
            <p className="text-gray-600 mb-4">Please add a subject first.</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setNoSubjectPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative">
            <h3 className="text-lg font-semibold mb-3 text-red-600">Delete Subject</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{confirmDelete.subject.name}</strong>? 
              This will also delete all associated students and data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
 