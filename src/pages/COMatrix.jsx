import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SubjectInfo from "../components/SubjectInfo";
import COMatrixTable from "../components/COMatrixTable";

export default function COMatrix({ subjects }) {
  const { idx } = useParams();
  const navigate = useNavigate();
  const subject = subjects && subjects[idx] ? subjects[idx] : null;

  const [coData, setCOData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem("authToken"), []);

  useEffect(() => {
    const loadCOMatrixData = async () => {
      if (!subject?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch CO configuration, students data, and components in parallel
        const [coResponse, studentsResponse, analyticsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/subjects/${subject._id}/course-outcomes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/students/subject/${subject._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/students/analytics/${subject._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [coResult, studentsResult, analyticsResult] = await Promise.all([
          coResponse.json(),
          studentsResponse.json(),
          analyticsResponse.json(),
        ]);

        if (!studentsResult.success) {
          throw new Error("Failed to fetch students data");
        }

        if (!analyticsResult.success) {
          throw new Error("Failed to fetch components data");
        }

        // Set students data and components
        setStudentsData(studentsResult.data || []);
        setComponents(analyticsResult.data?.components || []);

        // Set CO data (create default if none exists)
        if (coResult.success && coResult.data?.length > 0) {
          setCOData(coResult.data);
        } else {
          // Create default CO structure
          const defaultCOs = Array.from({ length: 8 }, (_, i) => ({
            coNumber: `CO${i + 1}`,
            description: `Course Outcome ${i + 1}`,
            measurementTool: "",
            toolType: "E",
            marksAssigned: 0,
            targetValue: 0,
            studentsNA: 0,
            studentsConsidered: 0,
            studentsAchievingTV: 0,
            percentageAchieving: 0,
            attainmentLevel: 0,
            indirectScore5pt: 0,
            indirectScore3pt: 0,
            overallScore: 0,
          }));
          setCOData(defaultCOs);
        }
      } catch (err) {
        console.error("Error loading CO matrix data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCOMatrixData();
  }, [subject?._id, token]);

  const handleSaveCOData = async (updatedCOData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/subjects/${subject._id}/course-outcomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseOutcomes: updatedCOData }),
      });

      const result = await response.json();
      if (result.success) {
        setCOData(result.data);
        alert("CO Matrix data saved successfully!");
      } else {
        alert("Error saving CO data: " + result.message);
      }
    } catch (err) {
      console.error("Error saving CO data:", err);
      alert("Error saving CO data");
    }
  };

  if (!subject) {
    return (
      <div className="pl-72 pt-8 pr-8 pb-10">
        <div className="p-6 text-center text-red-500">Subject not found.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pl-72 pt-8 pr-8 pb-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading CO Matrix...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-72 pt-8 pr-8 pb-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">Error Loading CO Matrix</p>
            <p>{error}</p>
            <button
              onClick={() => navigate(`/subject/${idx}/report`)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-72 pt-8 pr-8 pb-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              Course Outcome Matrix - {subject.name} ({subject.code})
            </h1>
            <p className="text-gray-600">Course Outcome Assessment & Analysis</p>
          </div>
          <button
            onClick={() => navigate(`/subject/${idx}/report`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Back to Report
          </button>
        </div>

        {/* Subject Information */}
        <SubjectInfo 
          subject={subject}
          studentsCount={studentsData.length}
          components={components}
        />

        {/* CO Matrix Table */}
        <COMatrixTable
          coData={coData}
          studentsData={studentsData}
          components={components}
          subject={subject}
          onSaveCOData={handleSaveCOData}
        />

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Configure measurement tools and target values for each Course Outcome</li>
            <li>Attainment Levels: Level 3 (≥75%), Level 2 (50-74%), Level 1 (30-49%), Level 0 (&lt;30%)</li>
            <li>Matrix calculations are based on actual student marks uploaded by faculty</li>
            <li>Save your configuration to preserve CO settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
