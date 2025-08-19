import React from "react";
import { useNavigate } from "react-router-dom";
import { IconDotsVertical } from "@tabler/icons-react";

export default function CoordinatorLanding({ subjects = [] }) {
  const navigate = useNavigate();

  if (subjects.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold text-gray-700">No Subjects Yet!</h2>
        <p className="text-gray-500 mt-2">
          Click "Add Subject" in the sidebar to create your first course.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {subjects.map((subject, idx) => (
        <div
          key={subject.code + idx}
          className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-lg"
        >
          {/* Card Banner Image */}
          <div
            className="h-24 rounded-t-lg bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://www.gstatic.com/classroom/themes/img_read.jpg')", // Example banner
            }}
            onClick={() => navigate(`/subject/${idx}`)}
          ></div>

          {/* Card Content styled to match the image */}
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/subject/${idx}`)}
              >
                <h3 className="font-medium text-xl text-gray-800 hover:text-blue-600">
                  {subject.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {subject.code}-{subject.semester}
                </p>
              </div>
              <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                <IconDotsVertical size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}