import React from "react";

export default function SubjectInfo({ subject, studentsCount, components }) {
  // Get current session (you can modify this logic as needed)
  const getCurrentSession = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Academic year logic (July to December = first half, January to June = second half)
    if (month >= 6) { // July onwards
      return `JUL${year.toString().slice(-2)}-DEC${year.toString().slice(-2)}`;
    } else {
      return `JAN${year.toString().slice(-2)}-JUN${year.toString().slice(-2)}`;
    }
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">Subject Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Course Details */}
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Course No.</span>
            <div className="text-lg font-semibold text-gray-800">{subject.code}</div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Course Title:</span>
            <div className="text-sm font-medium text-gray-800">{subject.name}</div>
          </div>
        </div>

        {/* Instructor & Session */}
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Instructor</span>
            <div className="text-lg font-semibold text-gray-800">
              {subject.coordinator?.name || "Not Assigned"}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Session</span>
            <div className="text-sm font-medium text-gray-800">{getCurrentSession()}</div>
          </div>
        </div>

        {/* Student & Semester Info */}
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Total Students</span>
            <div className="text-lg font-semibold text-blue-600">{studentsCount}</div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Semester</span>
            <div className="text-sm font-medium text-gray-800">{subject.semester}</div>
          </div>
        </div>

        {/* Assessment Components */}
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Assessment Components</span>
            <div className="text-sm text-gray-800">
              {components.filter(c => c.enabled).length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {components
                    .filter(c => c.enabled)
                    .map((comp) => (
                      <span
                        key={comp.name}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {comp.name}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-gray-500">No components configured</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Objectives */}
      {subject.courseObjectives && subject.courseObjectives.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <span className="text-sm font-medium text-gray-600">Course Objectives</span>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {subject.courseObjectives.slice(0, 4).map((objective, index) => (
              <div key={index} className="text-sm text-gray-700">
                <span className="font-medium">CO{index + 1}:</span> {objective}
              </div>
            ))}
          </div>
          {subject.courseObjectives.length > 4 && (
            <div className="text-xs text-gray-500 mt-1">
              ...and {subject.courseObjectives.length - 4} more objectives
            </div>
          )}
        </div>
      )}
    </div>
  );
}
