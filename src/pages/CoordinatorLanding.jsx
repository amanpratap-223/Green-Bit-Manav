import React from "react";
import { useNavigate } from "react-router-dom";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

export default function CoordinatorLanding({ subjects = [], onRemoveSubject }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {subjects.map((subject, idx) => (
          <div
            key={subject._id || subject.code + idx}
            className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-lg relative"
          >
            {/* Card Banner Image */}
            <div
              className="h-24 rounded-t-lg bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://www.gstatic.com/classroom/themes/img_read.jpg')",
              }}
              onClick={() => navigate(`/subject/${idx}`)}
            ></div>

            {/* Card Content styled to match the image */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => navigate(`/subject/${idx}`)}
                >
                  <h3 className="font-medium text-xl text-gray-800 hover:text-blue-600">
                    {subject.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {subject.code}-{subject.semester}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {subject._id && (
                    <button 
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      onClick={(e) => handleRemoveClick(e, idx, subject)}
                      title="Delete subject"
                      disabled={isDeleting}
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                  <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                    <IconDotsVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
