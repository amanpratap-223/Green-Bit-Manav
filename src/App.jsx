// // import React from 'react';
// // import COTable from './components/COtable';

// // const App = () => {
// //   return (
// //     <div className="min-h-screen flex flex-col items-center bg-black py-8 px-2">
// //   <h1
// //   className="text-3xl sm:text-4xl font-bold text-center mb-8 underline"
// //   style={{ color: "#fff", textDecorationColor: "#fff" }}
// // >
// //   🎓 Student CO Matrix
// // </h1>


// //       <div className="w-full flex justify-center">
// //         <COTable />
// //       </div>
// //     </div>
// //   );
// // };

// // export default App;


// import React from "react";
// import COTable from "./components/COtable";
// import COAnalyticsTable from "./components/COAnalyticsTable"; // Import here

// const App = () => {
//   return (
//     <div className="min-h-screen flex flex-col items-center bg-black py-8 px-2">
//       <h1
//         className="text-3xl sm:text-4xl font-bold text-center mb-8 underline"
//         style={{ color: "#fff", textDecorationColor: "#fff" }}
//       >
//         🎓 Student CO Matrix
//       </h1>
//       <div className="w-full flex justify-center">
//         <COTable />
//       </div>
//       {/* Add analytics table below */}
//       <COAnalyticsTable />
//     </div>
//   );
// };

// export default App;

import React, { useState } from "react";
import COTable from "./components/CoTable";
import COAnalyticsTable from "./components/COAnalyticsTable";

export default function App() {
  const [refreshAnalytics, setRefreshAnalytics] = useState(0);

  // Pass a function to COTable to let it trigger analytics refresh
  const handleMatrixSaved = () => setRefreshAnalytics(r => r + 1);

  return (
    <div className="min-h-screen flex flex-col items-center bg-black py-8 px-2">
      <h1
        className="text-3xl sm:text-4xl font-bold text-center mb-8 underline"
        style={{ color: "#fff", textDecorationColor: "#fff" }}
      >
        🎓 Student CO Matrix
      </h1>
      <div className="w-full flex justify-center">
        <COTable onMatrixSaved={handleMatrixSaved} />
      </div>
      <COAnalyticsTable refreshTrigger={refreshAnalytics} />
    </div>
  );
}
