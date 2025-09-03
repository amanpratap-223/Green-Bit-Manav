import React, { useState, useEffect } from "react";

export default function COMatrixTable({ coData, studentsData, components, subject, onSaveCOData }) {
  const [editableCOData, setEditableCOData] = useState(coData);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setEditableCOData(coData);
  }, [coData]);

  // Calculate CO metrics based on student data
  const calculateCOMetrics = (co, studentsData, components) => {
    if (!co.measurementTool || !studentsData.length) {
      return {
        studentsNA: 0,
        studentsConsidered: 0,
        studentsAchievingTV: 0,
        percentageAchieving: 0,
        attainmentLevel: 0,
      };
    }

    let studentsNA = 0;
    let studentsConsidered = 0;
    let studentsAchievingTV = 0;

    // Parse measurement tool (e.g., "MST Q1" -> component: MST, question: Q1)
    const toolParts = co.measurementTool.split(" ");
    const componentName = toolParts[0]; // MST, EST, etc.
    const questionPart = toolParts[1]; // Q1, Q2, etc.

    studentsData.forEach((student) => {
      const studentMarks = student.marks;
      let studentScore = null;

      if (studentMarks && studentMarks[componentName]) {
        const componentMarks = studentMarks[componentName];
        
        if (typeof componentMarks === 'object' && componentMarks.breakdown) {
          // Handle sub-component marks structure
          if (questionPart && componentMarks.breakdown[questionPart] !== undefined) {
            studentScore = componentMarks.breakdown[questionPart];
          } else if (componentMarks.total !== undefined) {
            studentScore = componentMarks.total;
          }
        } else if (typeof componentMarks === 'number') {
          // Handle simple number format
          studentScore = componentMarks;
        } else if (typeof componentMarks === 'object' && componentMarks.total !== undefined) {
          // Handle object with total but no breakdown
          studentScore = componentMarks.total;
        }
      }

      if (studentScore === null || studentScore === undefined || studentScore === "") {
        studentsNA++;
      } else {
        studentsConsidered++;
        if (Number(studentScore) >= co.targetValue) {
          studentsAchievingTV++;
        }
      }
    });

    const percentageAchieving = studentsConsidered > 0 
      ? (studentsAchievingTV / studentsConsidered) * 100 
      : 0;

    // Calculate attainment level based on percentage
    let attainmentLevel = 0;
    if (percentageAchieving >= 75) attainmentLevel = 3;
    else if (percentageAchieving >= 50) attainmentLevel = 2;
    else if (percentageAchieving >= 30) attainmentLevel = 1;

    return {
      studentsNA,
      studentsConsidered,
      studentsAchievingTV,
      percentageAchieving: Math.round(percentageAchieving * 100) / 100,
      attainmentLevel,
    };
  };

  // Get available measurement tools from components
  const getAvailableMeasurementTools = () => {
    const tools = [];
    components.forEach((comp) => {
      if (comp.enabled) {
        const questionCount = comp.questions || 3;
        for (let i = 1; i <= questionCount; i++) {
          tools.push(`${comp.name} Q${i}`);
        }
        // Also add total option
        tools.push(`${comp.name} Total`);
      }
    });
    return tools;
  };

  const availableTools = getAvailableMeasurementTools();

  const handleCODataChange = (index, field, value) => {
    const updatedData = [...editableCOData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setEditableCOData(updatedData);
  };

  const handleSave = () => {
    onSaveCOData(editableCOData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableCOData(coData);
    setIsEditing(false);
  };

  // Calculate metrics for all COs
  const calculatedCOData = editableCOData.map((co) => {
    const metrics = calculateCOMetrics(co, studentsData, components);
    return { ...co, ...metrics };
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Course Outcome Matrix</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Configure CO
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Configuration
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left border border-blue-500">COURSE OUTCOME FOR →</th>
              {calculatedCOData.slice(0, 8).map((co) => (
                <th key={co.coNumber} className="p-3 text-center border border-blue-500 min-w-[100px]">
                  {co.coNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Measurement Tool Row */}
            <tr className="bg-gray-50">
              <td className="p-3 font-semibold border border-gray-300">Measurement Tool used</td>
              {calculatedCOData.slice(0, 8).map((co, index) => (
                <td key={co.coNumber} className="p-2 border border-gray-300">
                  {isEditing ? (
                    <select
                      value={co.measurementTool}
                      onChange={(e) => handleCODataChange(index, 'measurementTool', e.target.value)}
                      className="w-full p-1 border rounded text-xs"
                    >
                      <option value="">Select Tool</option>
                      {availableTools.map((tool) => (
                        <option key={tool} value={tool}>
                          {tool}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs">{co.measurementTool || '-'}</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Tool Type Row */}
            <tr>
              <td className="p-3 font-semibold border border-gray-300">Type of Tool (E or I)</td>
              {calculatedCOData.slice(0, 8).map((co, index) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  {isEditing ? (
                    <select
                      value={co.toolType}
                      onChange={(e) => handleCODataChange(index, 'toolType', e.target.value)}
                      className="w-full p-1 border rounded"
                    >
                      <option value="E">E</option>
                      <option value="I">I</option>
                    </select>
                  ) : (
                    co.toolType || 'E'
                  )}
                </td>
              ))}
            </tr>

            {/* Marks Assigned Row */}
            <tr className="bg-gray-50">
              <td className="p-3 font-semibold border border-gray-300">Marks Assigned</td>
              {calculatedCOData.slice(0, 8).map((co, index) => (
                <td key={co.coNumber} className="p-2 border border-gray-300">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={co.marksAssigned}
                      onChange={(e) => handleCODataChange(index, 'marksAssigned', Number(e.target.value))}
                      className="w-full p-1 border rounded text-center"
                    />
                  ) : (
                    <div className="text-center">{co.marksAssigned || 0}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Target Value Row */}
            <tr>
              <td className="p-3 font-semibold border border-gray-300">Target value (TV)</td>
              {calculatedCOData.slice(0, 8).map((co, index) => (
                <td key={co.coNumber} className="p-2 border border-gray-300">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={co.targetValue}
                      onChange={(e) => handleCODataChange(index, 'targetValue', Number(e.target.value))}
                      className="w-full p-1 border rounded text-center"
                    />
                  ) : (
                    <div className="text-center text-red-600 font-semibold">{co.targetValue || 0}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Students (NA) Row */}
            <tr className="bg-gray-50">
              <td className="p-3 font-semibold border border-gray-300">Students (NA)</td>
              {calculatedCOData.slice(0, 8).map((co) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  {co.studentsNA || 0}
                </td>
              ))}
            </tr>

            {/* Students considered Row */}
            <tr>
              <td className="p-3 font-semibold border border-gray-300">Students considered</td>
              {calculatedCOData.slice(0, 8).map((co) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  {co.studentsConsidered || 0}
                </td>
              ))}
            </tr>

            {/* Students with marks >= TV Row */}
            <tr className="bg-gray-50">
              <td className="p-3 font-semibold border border-gray-300">Students with marks ≥ TV</td>
              {calculatedCOData.slice(0, 8).map((co) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  {co.studentsAchievingTV || 0}
                </td>
              ))}
            </tr>

            {/* Percentage Row */}
            <tr>
              <td className="p-3 font-semibold border border-gray-300">% of students achieving the TV</td>
              {calculatedCOData.slice(0, 8).map((co) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  <span className="text-red-600 font-semibold">
                    {co.percentageAchieving?.toFixed(1) || '0.0'}
                  </span>
                </td>
              ))}
            </tr>

            {/* CO Attainment Level Row */}
            <tr className="bg-green-100">
              <td className="p-3 font-semibold border border-gray-300">CO Attainment Level</td>
              {calculatedCOData.slice(0, 8).map((co) => (
                <td key={co.coNumber} className="p-2 border border-gray-300 text-center">
                  <span 
                    className={`px-2 py-1 rounded font-bold ${
                      co.attainmentLevel === 3 ? 'bg-green-200 text-green-800' :
                      co.attainmentLevel === 2 ? 'bg-yellow-200 text-yellow-800' :
                      co.attainmentLevel === 1 ? 'bg-orange-200 text-orange-800' :
                      'bg-red-200 text-red-800'
                    }`}
                  >
                    {co.attainmentLevel || 0}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">CO Attainment Level Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-200 border border-green-300 rounded mr-2"></span>
            <span>Level 3: ≥75%</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded mr-2"></span>
            <span>Level 2: 50-74%</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-orange-200 border border-orange-300 rounded mr-2"></span>
            <span>Level 1: 30-49%</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-200 border border-red-300 rounded mr-2"></span>
            <span>Level 0: &lt;30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
