import React, { useState } from "react";
import {
  IconBook,
  IconPlus,
  IconHelp,
  IconSettings,
  IconChevronDown,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";


const bottomItems = [
  { label: "Help & Support", icon: <IconHelp size={22} />, link: "#" },
  { label: "Settings", icon: <IconSettings size={22} />, link: "#" },
];

export default function Sidebar({ subjects = [], onAddSubject }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [noSubjectPopup, setNoSubjectPopup] = useState(false);
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
    // You can optionally navigate to the subject detail page from here too
    navigate(`/subject/${idx}`);
  }

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
                    <li key={subj.code}>
                      <button
                        className="w-full text-left px-4 py-2 text-white/90 hover:bg-blue-900/80 flex flex-col items-start"
                        onClick={() => handleSubjectSelect(idx)}
                      >
                        <span className="font-semibold">{subj.name}</span>
                        <span className="text-blue-300 text-xs">
                          {subj.code}
                        </span>
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
    </>
  );
}