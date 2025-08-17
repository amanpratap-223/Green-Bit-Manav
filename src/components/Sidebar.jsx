import React, { useState } from "react";
import {
  IconBook,
  IconPlus,
  IconHelp,
  IconSettings,
  IconChevronDown,
} from "@tabler/icons-react";

const bottomItems = [
  { label: "Help & Support", icon: <IconHelp size={22} />, link: "#" },
  { label: "Settings", icon: <IconSettings size={22} />, link: "#" },
];

const COURSE_OBJECTIVES_PCS113 = `
PCS113: LINEAR ALGEBRA AND APPLIED STATISTICAL METHODS

Course Objectives: The course aims to introduce to the students, fundamental principles as well as advanced topics in statistics and sampling techniques. This course underscores the importance of statistical methods to perform scientific and engineering research

Linear Algebra: Introduction to matrices, rank of matrix, System of linear equations, Eigenvalues and Eigenvectors, diagonalization, vector spaces, subspace, span, linear independence/dependence, basis, dimension and linear transformation.

Basic Probability and Statistical Principles: Event, probability, axioms of probability, conditional probability, Bayes' rule, independence, random variables, probability mass function, probability density function, expectation, functions of random variables, normal distribution, central limit theorem.

Hypothesis tests: Introduction to sampling distributions (standard Normal, chi-square, F and t distributions) and their properties, introduction to hypothesis tests (difference between one tailed and two tailed tests), level of significance of test and power of test, one way ANOVA, two-way ANOVA with examples for sustainability studies such as applications in climate change research and energy efficiency.

Laboratory work:
- Apply linear algebraic methods to perform computational task.
- Design an experiment using hypothesis testing and ANOVA to derive statistical inferences.
- Analyze time series data with different time series models.
`;

export default function Sidebar({ onNavigate }) {
  const [subjects, setSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState({
    name: "",
    code: "",
    semester: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

  // Only single course details modal
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [courseDetailIndex, setCourseDetailIndex] = useState(null);

  const [noSubjectPopup, setNoSubjectPopup] = useState(false);

  function handleAddSubjectInputChange(e) {
    const { name, value } = e.target;
    setSubjectInputs((prev) => ({ ...prev, [name]: value }));
  }

  function openAddSubjectModal() {
    setSubjectInputs({ name: "", code: "", semester: "" });
    setModalOpen(true);
    setSelectedSubjectIndex(null); // Hide card(s) by deselecting index
  }

  function closeAddSubjectModal() {
    setModalOpen(false);
    // nothing to do, cards will show automatically when subjects exist and modal is shut
  }

  function handleCreateSubject() {
    if (
      !subjectInputs.name.trim() ||
      !subjectInputs.code.trim() ||
      !subjectInputs.semester.trim()
    ) {
      alert("All fields required!");
      return;
    }
    setSubjects((prev) => [
      ...prev,
      {
        name: subjectInputs.name.trim(),
        code: subjectInputs.code.trim(),
        semester: subjectInputs.semester.trim(),
      },
    ]);
    setModalOpen(false);
    // cards will show as all subjects
    setSelectedSubjectIndex(null); // Show all
  }

  function handleDropdownClick() {
    if (subjects.length === 0) {
      setNoSubjectPopup(true);
    } else {
      setDropdownOpen((d) => !d);
    }
  }

  function handleSubjectSelect(idx) {
    setSelectedSubjectIndex(idx); // If you want to highlight/scroll to a card, can adjust logic here
    setDropdownOpen(false);
  }

  function handleShowCourseDetails(idx) {
    setCourseDetailIndex(idx);
    setShowCourseDetails(true);
  }

  function handleCourseDetailsClose() {
    setShowCourseDetails(false);
    setCourseDetailIndex(null);
    // cards remain visible
  }

  function getCourseDetails(subject) {
    if (subject.code === "PCS113") return COURSE_OBJECTIVES_PCS113;
    else return `Course objectives are not uploaded for ${subject.code}.`;
  }

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-gradient-to-b from-blue-800 to-blue-500 shadow-xl z-50">
        {/* Logo and controls */}
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <span className="text-white text-2xl font-bold tracking-wider mb-1">
            Sidebar
          </span>
          <div className="w-full flex flex-col gap-2 items-center">
            <div className="w-[90%]">
              <button
                className="w-full flex items-center justify-between bg-blue-900 rounded-md px-4 py-2 text-white font-semibold"
                onClick={handleDropdownClick}
              >
                <span className="flex items-center gap-2">
                  <IconBook size={22} />
                  Subject
                </span>
                <IconChevronDown size={18} color="white" />
              </button>
              {/* Dropdown list */}
              {dropdownOpen && subjects.length > 0 && (
                <ul className="bg-blue-700 rounded-b shadow mt-1">
                  {subjects.map((subj, idx) => (
                    <li key={subj.code}>
                      <button
                        className="w-full text-left px-4 py-2 text-white hover:bg-blue-800 flex items-center gap-2"
                        onClick={() => handleSubjectSelect(idx)}
                      >
                        <span>{subj.name}</span>
                        <span className="text-blue-300 text-xs">
                          [{subj.code}]
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="w-[90%] flex items-center gap-3 px-4 py-2 rounded-md text-white font-bold text-blue-300 justify-start"
              onClick={openAddSubjectModal}
            >
              <IconPlus size={22} />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
        {/* Bottom Items */}
        <div className="mb-6 space-y-2 px-2">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-white bg-transparent"
              onClick={() => onNavigate && onNavigate(item.label)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Modal: Add Subject */}
      {modalOpen && (
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
                    onChange={handleAddSubjectInputChange}
                    placeholder={label}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateSubject}
              className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-md py-2 hover:bg-blue-700 transition"
            >
              Create
            </button>
            <button
              onClick={closeAddSubjectModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
              title="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      {/* Modal: No Subject Added notice */}
      {noSubjectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg max-w-xs w-full p-5 shadow-lg relative text-center">
            <h3 className="text-lg font-semibold mb-3">No subject added</h3>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setNoSubjectPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Subject Cards */}
      {!modalOpen && subjects.length > 0 && (
        <div
          style={{
            position: "fixed",
            left: "260px",             // sidebar is 256/264px, so this leaves a gap
            top: "110px",              // extra gap from top navbar
            display: "flex",
            gap: "32px",               // distance between the cards
            zIndex: 80,
          }}
        >
          {subjects.map((subject, idx) => (
            <div
              key={subject.code + idx}
              className="bg-white rounded-lg shadow border"
              style={{
                width: "330px",
                marginRight: "0px",
                marginBottom: "0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/45/Blue_background.jpg"
                alt="banner"
                style={{
                  width: "100%",
                  height: "85px",
                  objectFit: "cover",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              />
              <div className="p-5">
                <div className="font-bold text-base text-gray-700 mb-1">
                  {subject.name}
                </div>
                <div className="font-normal text-xs text-slate-500 mb-2">
                  {subject.code} &mdash; {subject.semester}
                </div>
                <div className="font-semibold text-sm mb-2">
                  INNOVATION AND ENTREPRENEURSHIP &mdash; UTA025-2526ODDSEM
                </div>
                <div className="w-full bg-gray-200 h-2 rounded mb-1">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: "0%",
                      height: "100%",
                      borderRadius: 8,
                    }}
                  />
                </div>
                
                
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Objectives modal */}
      {showCourseDetails &&
        courseDetailIndex !== null &&
        subjects[courseDetailIndex] && (
          <div
            className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-[9999]"
            style={{ minHeight: "100vh", overflowY: "auto" }}
          >
            <div
              className="bg-white rounded-lg shadow-lg relative"
              style={{
                width: "70vw",
                height: "80vh",
                maxWidth: "900px",
                padding: "2rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <h2 className="text-xl font-bold mb-4">
                {subjects[courseDetailIndex].name} - {subjects[courseDetailIndex].code}
              </h2>
              <pre
                className="whitespace-pre-wrap font-sans text-md text-gray-800"
                style={{ flex: 1, overflowY: "auto" }}
              >
                {getCourseDetails(subjects[courseDetailIndex])}
              </pre>
              <button
                onClick={handleCourseDetailsClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl bg-white border-none cursor-pointer"
                aria-label="Close modal"
                title="Close"
                style={{
                  background: "none",
                  border: "none",
                }}
              >
                &#10005;
              </button>
            </div>
          </div>
        )}
    </>
  );
}
