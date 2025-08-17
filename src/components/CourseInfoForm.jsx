  import React from "react";

  export default function CourseInfoForm({
    courseInfo,
    setCourseInfo,
    selectedCourse
  }) {
    // Update fields except Course No.
    const handleChange = (e) => {
      setCourseInfo({ ...courseInfo, [e.target.name]: e.target.value });
    };

    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 min-w-[320px] max-w-xs border-2 border-blue-600">
        <div className="mb-3">
          <label className="font-semibold text-blue-800">Course No.</label>
          <input
            className="w-full border border-blue-300 rounded px-2 py-1 bg-blue-100 cursor-not-allowed font-bold"
            type="text"
            name="courseNo"
            value={selectedCourse}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="font-semibold text-blue-800">Course Title</label>
          <input
            className="w-full border border-blue-300 rounded px-2 py-1"
            type="text"
            name="courseTitle"
            value={courseInfo.courseTitle}
            onChange={handleChange}
            placeholder="Enter title"
          />
        </div>
        <div className="mb-3">
          <label className="font-semibold text-blue-800">Instructor</label>
          <input
            className="w-full border border-blue-300 rounded px-2 py-1"
            type="text"
            name="instructor"
            value={courseInfo.instructor}
            onChange={handleChange}
            placeholder="Enter instructor"
          />
        </div>
        <div className="mb-3">
          <label className="font-semibold text-blue-800">Session</label>
          <input
            className="w-full border border-blue-300 rounded px-2 py-1"
            type="text"
            name="session"
            value={courseInfo.session}
            onChange={handleChange}
            placeholder="Enter session"
          />
        </div>
        <div className="mb-1">
          <label className="font-semibold text-blue-800">Total Students</label>
          <input
            className="w-full border border-blue-300 rounded px-2 py-1"
            type="number"
            min={0}
            name="totalStudents"
            value={courseInfo.totalStudents}
            onChange={handleChange}
            placeholder="Total"
          />
        </div>
      </div>
    );
  }
  //