import React, { useEffect, useMemo, useState, useCallback } from "react";

export default function FacultyLanding({ user, subjects, onRefreshSubjects, refreshTrigger, isRefreshing }) {
  const token = useMemo(() => localStorage.getItem("authToken"), []);
  
  // 🔥 ENHANCED: Better subject filtering logic
  const mySubjects = useMemo(() => {
    const me = String(user?.id || user?._id || "");
    console.log('👤 Current faculty ID:', me);
    
    if (!subjects || subjects.length === 0) {
      console.log('📚 No subjects available');
      return [];
    }
    
    const filtered = subjects.filter((s) => {
      if (!s.facultyAssignments || s.facultyAssignments.length === 0) {
        return false;
      }
      
      const hasAssignment = s.facultyAssignments.some((a) => {
        // Handle different faculty ID formats
        const facultyId = a.faculty?._id || a.faculty?.id || a.faculty;
        const match = String(facultyId) === me;
        
        if (match) {
          console.log(`✅ Faculty assigned to ${s.name} - Subgroup: ${a.subgroup}`);
        }
        return match;
      });
      
      return hasAssignment;
    });
    
    console.log('📚 Faculty assigned subjects:', filtered.length);
    filtered.forEach(s => {
      const myAssignments = s.facultyAssignments.filter(a => {
        const facultyId = a.faculty?._id || a.faculty?.id || a.faculty;
        return String(facultyId) === me;
      });
      console.log(`  - ${s.name}: ${myAssignments.map(a => a.subgroup).join(', ')}`);
    });
    
    return filtered;
  }, [subjects, user]);

  const [rowsBySubj, setRowsBySubj] = useState({});
  const [compsBySubj, setCompsBySubj] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletedSubjects, setDeletedSubjects] = useState(new Set());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 🔥 ENHANCED: Better data fetching with comprehensive logging
  const fetchSubjectData = useCallback(async (subject) => {
    try {
      console.log(`📡 Fetching data for subject: ${subject.name} (${subject._id})`);
      
      // Fetch analytics first
      const analyticsResponse = await fetch(
        `http://localhost:5000/api/students/analytics/${subject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!analyticsResponse.ok) {
        throw new Error(`Analytics request failed: ${analyticsResponse.status}`);
      }
      
      const an = await analyticsResponse.json();
      
      if (!an.success) {
        console.warn(`❌ Analytics failed for ${subject.name}:`, an.message);
        if (an.message.includes('not found') || an.message.includes('unauthorized')) {
          setDeletedSubjects(prev => new Set(prev).add(subject._id));
          return false;
        }
        return false;
      }

      // Process components
      const enabledComponents = (an.data.components || []).filter((c) => c.enabled);
      console.log(`📊 Found ${enabledComponents.length} enabled components for ${subject.name}`);
      
      setCompsBySubj((m) => ({
        ...m,
        [subject._id]: enabledComponents,
      }));

      // Fetch students
      const studentsResponse = await fetch(
        `http://localhost:5000/api/students/subject/${subject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!studentsResponse.ok) {
        throw new Error(`Students request failed: ${studentsResponse.status}`);
      }
      
      const st = await studentsResponse.json();
      
      if (!st.success) {
        console.warn(`❌ Students fetch failed for ${subject.name}:`, st.message);
        if (st.message.includes('not found') || st.message.includes('unauthorized')) {
          setDeletedSubjects(prev => new Set(prev).add(subject._id));
          return false;
        }
        return false;
      }

      // 🔥 ENHANCED: Process all students with better logging
      console.log(`👥 Raw students data for ${subject.name}:`, st.data.length, 'students');
      
      // Group students by subgroup for debugging
      const studentsBySubgroup = st.data.reduce((acc, student) => {
        const subgroup = student.subgroup || 'No Subgroup';
        acc[subgroup] = (acc[subgroup] || []).concat(student.rollNo);
        return acc;
      }, {});
      console.log(`📊 Students by subgroup for ${subject.name}:`, studentsBySubgroup);

      const enabledNames = enabledComponents.map((c) => c.name);
      
      // 🔥 ENHANCED: Process each student individually to ensure no data loss
      const rows = st.data.map((stu, index) => {
        const base = {
          rollNo: stu.rollNo,
          name: stu.name,
          subgroup: stu.subgroup || "",
          branch: stu.branch || "",
          _studentIndex: index, // Add index for debugging
        };
        
        // Process marks for each enabled component
        enabledNames.forEach((compName) => {
          const markData = stu.marks?.[compName];
          
          if (markData && typeof markData === 'object' && markData.breakdown) {
            // Handle sub-component marks with breakdown
            Object.entries(markData.breakdown).forEach(([qNum, qVal]) => {
              base[`${compName}(${qNum})`] = qVal || "";
            });
            base[`${compName}_Total`] = markData.total || "";
          } else if (markData && typeof markData === 'object' && markData.total !== undefined) {
            // Handle object format without breakdown
            base[`${compName}_Total`] = markData.total || "";
          } else if (markData) {
            // Handle simple value format (backward compatibility)
            base[compName] = markData || "";
          } else {
            // No marks data
            base[compName] = "";
          }
        });
        
        return base;
      });
      
      console.log(`✅ Processed ${rows.length} student rows for ${subject.name}`);
      console.log(`📋 Sample processed data:`, rows.slice(0, 2)); // Log first 2 students for debugging
      
      setRowsBySubj((m) => ({ 
        ...m, 
        [subject._id]: rows 
      }));
      
      return true;
    } catch (e) {
      console.error(`❌ Error fetching data for ${subject.name}:`, e);
      return false;
    }
  }, [token]);

  // 🔥 ENHANCED: Better data loading with state management
  const loadAllSubjectData = useCallback(async () => {
    if (mySubjects.length === 0) {
      console.log('📚 No subjects assigned to faculty');
      setRowsBySubj({});
      setCompsBySubj({});
      setIsLoadingData(false);
      return;
    }

    console.log('🔄 Loading data for all subjects...');
    setIsLoadingData(true);
    
    // Clear previous data
    setRowsBySubj({});
    setCompsBySubj({});
    
    const validSubjects = [];
    let totalStudentsLoaded = 0;
    
    // Process subjects sequentially to avoid overwhelming the server
    for (const s of mySubjects) {
      console.log(`📖 Processing subject: ${s.name}`);
      const isValid = await fetchSubjectData(s);
      if (isValid) {
        validSubjects.push(s._id);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Count total students loaded
    Object.values(rowsBySubj).forEach(rows => {
      totalStudentsLoaded += rows.length;
    });
    
    console.log('✅ Data loading completed:', {
      validSubjects: validSubjects.length,
      totalStudentsLoaded,
      deletedSubjects: deletedSubjects.size
    });
    
    setIsLoadingData(false);
    
    // Handle deleted subjects
    if (deletedSubjects.size > 0) {
      console.log('🗑️ Detected deleted subjects, triggering refresh...');
      setTimeout(() => {
        onRefreshSubjects?.();
      }, 2000);
    }
  }, [mySubjects, fetchSubjectData, deletedSubjects.size, onRefreshSubjects, rowsBySubj]);

  // 🔥 ENHANCED: Better effect management
  useEffect(() => {
    console.log('🔄 Faculty component effect triggered');
    console.log('- My subjects count:', mySubjects.length);
    console.log('- Refresh trigger:', refreshTrigger);
    console.log('- Is refreshing:', isRefreshing);
    
    if (mySubjects.length > 0) {
      loadAllSubjectData();
    }
  }, [mySubjects, refreshTrigger]);

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered by faculty');
    if (onRefreshSubjects) {
      onRefreshSubjects();
    }
  };

  const activeSubjects = mySubjects.filter(s => !deletedSubjects.has(s._id));

  const handleCellChange = (subjId, rowIdx, compName, value) => {
    if (user?.role === "coordinator") {
      return;
    }
    
    setRowsBySubj((m) => {
      const rows = [...(m[subjId] || [])];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [compName]: value };
      }
      return { ...m, [subjId]: rows };
    });
  };

  const handleSave = async (subjId) => {
    try {
      setSaving(true);
      const rows = (rowsBySubj[subjId] || []).map((r) => {
        const { rollNo, name, subgroup, branch, _studentIndex, ...rest } = r;
        return {
          rollNo,
          marks: rest,
        };
      });
      
      console.log(`💾 Saving marks for ${rows.length} students in subject ${subjId}`);
      
      const res = await fetch(
        `http://localhost:5000/api/students/subject/${subjId}/marks`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rows }),
        }
      ).then((r) => r.json());
      
      if (!res.success && res.message.includes('not found')) {
        alert('This subject has been deleted. The page will refresh.');
        setDeletedSubjects(prev => new Set(prev).add(subjId));
        onRefreshSubjects?.();
        return;
      }
      
      if (res.success) {
        console.log(`✅ Marks saved successfully: ${res.data.updated} students updated`);
        alert(`Marks saved successfully! Updated: ${res.data.updated} students`);
      } else {
        console.error(`❌ Save failed:`, res);
        alert(res.message || "Failed to save marks");
      }
    } catch (e) {
      console.error('❌ Save error:', e);
      alert("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const firstName = (user?.name || "").split(" ")[0] || user?.name || "";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Faculty Dashboard</h1>
          <p className="text-gray-600">Welcome, {firstName}</p>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoadingData}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${(isRefreshing || isLoadingData) ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{(isRefreshing || isLoadingData) ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoadingData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800">Loading student data...</p>
          </div>
        </div>
      )}

      {/* Coordinator view-only notice */}
      {user?.role === "coordinator" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">View Only Mode</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>As a coordinator, you can view marks but cannot edit them. Only faculty members can enter and modify student marks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No subjects message */}
      {activeSubjects.length === 0 && !isLoadingData && (
        <div className="p-6 bg-white border rounded-lg">
          <p className="text-gray-500">No subjects assigned yet.</p>
          {deletedSubjects.size > 0 && (
            <p className="text-orange-500 text-sm mt-2">
              Some subjects may have been deleted. The page will refresh automatically.
            </p>
          )}
        </div>
      )}

      {/* Subject cards */}
      {activeSubjects.map((s) => {
        const rows = rowsBySubj[s._id] || [];
        const comps = compsBySubj[s._id] || [];
        
        // 🔥 DEBUG: Log data for each subject
        console.log(`🎯 Rendering subject ${s.name}: ${rows.length} students, ${comps.length} components`);
        
        return (
          <div key={s._id} className="bg-white border rounded-lg mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {s.name} ({s.code})
                  </h2>
                  <p className="text-gray-600">Semester: {s.semester}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {rows.length} students in your assigned subgroups
                  </p>
                  {/* 🔥 DEBUG: Show subgroup distribution */}
                  {rows.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Subgroups: {[...new Set(rows.map(r => r.subgroup).filter(Boolean))].join(', ')}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Assigned
                </span>
              </div>

              <div className="mt-4 text-sm">
                <p className="mb-1">
                  <span className="font-medium">Coordinator:</span>{" "}
                  {s.coordinator?.name || "-"}
                </p>
                {s.courseObjectives?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Course Objectives</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {s.courseObjectives.map((co, i) => (
                        <li key={i}>{co}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  {user?.role === "coordinator" ? "View Marks" : "Enter Marks"}
                </h3>
                {user?.role !== "coordinator" && (
                  <button
                    onClick={() => handleSave(s._id)}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Marks"}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2 border">Roll No.</th>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Subgroup</th>
                      <th className="p-2 border">Branch</th>
                      {comps.map((c) => {
                        const headers = [];
                        const questionCount = c.questions || 3;
                        
                        for (let i = 1; i <= questionCount; i++) {
                          headers.push(
                            <th key={`${c.name}-Q${i}`} className="p-2 border text-center">
                              {c.name}(Q{i})
                            </th>
                          );
                        }
                        
                        headers.push(
                          <th key={`${c.name}-Total`} className="p-2 border text-center bg-blue-50">
                            {c.name} Total
                          </th>
                        );
                        
                        return headers;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={`${r.rollNo}-${idx}`} className="hover:bg-gray-50">
                        <td className="p-2 border">{r.rollNo}</td>
                        <td className="p-2 border">{r.name}</td>
                        <td className="p-2 border">{r.subgroup}</td>
                        <td className="p-2 border">{r.branch}</td>
                        {comps.map((c) => {
                          const cells = [];
                          const questionCount = c.questions || 3;
                          
                          for (let i = 1; i <= questionCount; i++) {
                            const fieldName = `${c.name}(Q${i})`;
                            const maxPerQuestion = Math.floor(c.maxMarks / questionCount);
                            
                            cells.push(
                              <td key={fieldName} className="p-2 border">
                                <input
                                  type="number"
                                  min="0"
                                  max={maxPerQuestion}
                                  placeholder={`0-${maxPerQuestion}`}
                                  value={r[fieldName] ?? ""}
                                  onChange={(e) =>
                                    handleCellChange(
                                      s._id,
                                      idx,
                                      fieldName,
                                      e.target.value
                                    )
                                  }
                                  className={`w-16 border rounded px-1 py-1 text-center ${
                                    user?.role === "coordinator" 
                                      ? "bg-gray-100 cursor-not-allowed" 
                                      : ""
                                  }`}
                                  disabled={user?.role === "coordinator"}
                                  title={
                                    user?.role === "coordinator" 
                                      ? "Coordinators cannot edit marks" 
                                      : ""
                                  }
                                />
                              </td>
                            );
                          }
                          
                          const totalValue = (() => {
                            let sum = 0;
                            for (let i = 1; i <= questionCount; i++) {
                              const val = Number(r[`${c.name}(Q${i})`] || 0);
                              sum += val;
                            }
                            return sum;
                          })();
                          
                          cells.push(
                            <td key={`${c.name}-Total`} className="p-2 border bg-blue-50">
                              <div className="w-16 text-center font-semibold text-blue-800">
                                {totalValue}
                              </div>
                            </td>
                          );
                          
                          return cells;
                        })}
                      </tr>
                    ))}
                    {rows.length === 0 && !isLoadingData && (
                      <tr>
                        <td
                          className="p-4 text-center text-gray-500 border"
                          colSpan={4 + comps.reduce((sum, c) => sum + (c.questions || 3) + 1, 0)}
                        >
                          No students found for this subject in your assigned subgroups.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
