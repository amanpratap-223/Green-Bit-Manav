


// // import React, { useState } from "react";
// // import Spreadsheet from "react-spreadsheet";

// // const initialData = [
// //   [
// //     { value: "Roll No" },
// //     { value: "Name" },
// //     { value: "CO1" },
// //     { value: "CO2" },
// //     { value: "CO3" },
// //     { value: "CO4" },
// //     { value: "CO5" },
// //     { value: "CO6" },
// //     { value: "CO7" },
// //     { value: "CO8" },
// //   ],
// //   [{ value: "8024320001" }, { value: "Aanchal Garg" }, { value: 4.5 }, { value: 8 }, { value: 6 }, { value: 4 }, { value: 5.5 }, { value: 8 }, { value: 7 }, { value: 9 }],
// //   [{ value: "8024320002" }, { value: "Aarij Rabbani" }, { value: 6 }, { value: 8 }, { value: 8 }, { value: 5 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 7 }],
// //   [{ value: "8024320004" }, { value: "Abhinav Agnihotri" }, { value: 4 }, { value: 6 }, { value: 6 }, { value: 4 }, { value: 4.5 }, { value: 5 }, { value: 7 }, { value: 6 }],
// //   [{ value: "8024320005" }, { value: "Abhinav Krishna" }, { value: 4 }, { value: 8 }, { value: "NA" }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 8 }],
// //   [{ value: "8024320006" }, { value: "Abhinav Kumar" }, { value: 4 }, { value: 6 }, { value: 8 }, { value: 4 }, { value: 4.5 }, { value: 6 }, { value: 5 }, { value: 7 }],
// //   [{ value: "8024320007" }, { value: "Abhishek Mohan" }, { value: 1.5 }, { value: 6 }, { value: 5 }, { value: 5 }, { value: 4 }, { value: 6 }, { value: 5 }, { value: 4 }],
// //   [{ value: "8024320008" }, { value: "Aditya" }, { value: "NA" }, { value: 7 }, { value: 6 }, { value: 4 }, { value: 3.5 }, { value: 6 }, { value: 7 }, { value: 7 }],
// //   [{ value: "8024320009" }, { value: "Aditya Chanan" }, { value: 4 }, { value: 6 }, { value: 6 }, { value: 4 }, { value: 4 }, { value: 8 }, { value: 8 }, { value: 8 }],
// //   [{ value: "8024320010" }, { value: "Student X" }, { value: 5 }, { value: 7 }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 7 }],
// //   [{ value: "8024320011" }, { value: "Student Y" }, { value: 6 }, { value: 5 }, { value: 8 }, { value: 8 }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 9 }],
// //   [{ value: "8024320012" }, { value: "Student Z" }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 6 }, { value: 8 }, { value: 9 }, { value: 6 }],
// // ];


// // const COTable = () => {
// //   const [data, setData] = useState(initialData);

// //   return (
// //     <div
// //       className="
// //         bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/70
// //         px-4 py-4
// //         w-full
// //         max-w-full
// //         sm:max-w-3xl
// //         md:max-w-4xl
// //         lg:max-w-6xl
// //         xl:max-w-7xl
// //         2xl:max-w-[96vw]
// //         mx-auto
// //         overflow-x-auto
// //       "
// //     >
// //       <div className="spreadsheet-min-width">
// //         <Spreadsheet
// //           data={data}
// //           onChange={setData}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default COTable;

// import React, { useState } from "react";
// import Spreadsheet from "react-spreadsheet";


// const initialData = [
//   [
//     { value: "Roll No" }, { value: "Name" }, { value: "CO1" }, { value: "CO2" }, { value: "CO3" }, { value: "CO4" }
//   ],
//   [{ value: "8024320001" }, { value: "Aanchal Garg" }, { value: 4.5 }, { value: 8 }, { value: 6 }, { value: 4 }],
//   [{ value: "8024320002" }, { value: "Aarij Rabbani" }, { value: 6 }, { value: 8 }, { value: 8 }, { value: 5 }],
// ];

// const COTable = () => {
//   const [data, setData] = useState(initialData);

//   // Add Row at the end
//   const handleAddRow = () => {
//     const numCols = data[0].length;
//     // For first row (header), create empty header cells; for others, empty values
//     const newRow = Array(numCols)
//       .fill()
//       .map((_, idx) => ({ value: "" }));
//     setData([...data, newRow]);
//   };

//   // Add Column at the end
//   const handleAddColumn = () => {
//     // Prompt for column header (optional)
//     const colName = prompt("Enter column name:", "New Column") || "New Column";
//     setData((prev) =>
//       prev.map((row, rowIdx) =>
//         [...row, { value: rowIdx === 0 ? colName : "" }]
//       )
//     );
//   };

//   return (
//     <div className="w-full bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/70 px-4 py-4 max-w-5xl mx-auto overflow-x-auto">
//       <div className="flex gap-2 mb-3">
//         <button
//           className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
//           onClick={handleAddRow}
//         >
//           Add Row
//         </button>
//         <button
//           className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//           onClick={handleAddColumn}
//         >
//           Add Column
//         </button>
//       </div>
//       <Spreadsheet data={data} onChange={setData} />
//     </div>
//   );
// };

// export default COTable;

import React, { useState } from "react";
import Spreadsheet from "react-spreadsheet";

// const initialData = [
//   [
//     { value: "Roll No" }, { value: "Name" }, { value: "CO1" }, { value: "CO2" }, { value: "CO3" }, { value: "CO4" }
//   ],
//   [{ value: "8024320001" }, { value: "Aanchal Garg" }, { value: 4.5 }, { value: 8 }, { value: 6 }, { value: 4 }],
//   [{ value: "8024320002" }, { value: "Aarij Rabbani" }, { value: 6 }, { value: 8 }, { value: 8 }, { value: 5 }],
// ];


const initialData = [
  [
    { value: "Roll No" },
    { value: "Name" },
    { value: "CO1" },
    { value: "CO2" },
    { value: "CO3" },
    { value: "CO4" },
    { value: "CO5" },
    { value: "CO6" },
    { value: "CO7" },
    { value: "CO8" },
  ],
  [{ value: "8024320001" }, { value: "Aanchal Garg" }, { value: 4.5 }, { value: 8 }, { value: 6 }, { value: 4 }, { value: 5.5 }, { value: 8 }, { value: 7 }, { value: 9 }],
  [{ value: "8024320002" }, { value: "Aarij Rabbani" }, { value: 6 }, { value: 8 }, { value: 8 }, { value: 5 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 7 }],
  [{ value: "8024320004" }, { value: "Abhinav Agnihotri" }, { value: 4 }, { value: 6 }, { value: 6 }, { value: 4 }, { value: 4.5 }, { value: 5 }, { value: 7 }, { value: 6 }],
  [{ value: "8024320005" }, { value: "Abhinav Krishna" }, { value: 4 }, { value: 8 }, { value: "NA" }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 8 }],
  [{ value: "8024320006" }, { value: "Abhinav Kumar" }, { value: 4 }, { value: 6 }, { value: 8 }, { value: 4 }, { value: 4.5 }, { value: 6 }, { value: 5 }, { value: 7 }],
  [{ value: "8024320007" }, { value: "Abhishek Mohan" }, { value: 1.5 }, { value: 6 }, { value: 5 }, { value: 5 }, { value: 4 }, { value: 6 }, { value: 5 }, { value: 4 }],
  [{ value: "8024320008" }, { value: "Aditya" }, { value: "NA" }, { value: 7 }, { value: 6 }, { value: 4 }, { value: 3.5 }, { value: 6 }, { value: 7 }, { value: 7 }],
  [{ value: "8024320009" }, { value: "Aditya Chanan" }, { value: 4 }, { value: 6 }, { value: 6 }, { value: 4 }, { value: 4 }, { value: 8 }, { value: 8 }, { value: 8 }],
  [{ value: "8024320010" }, { value: "Aman " }, { value: 5 }, { value: 7 }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 7 }],
  [{ value: "8024320011" }, { value: "Manas" }, { value: 6 }, { value: 5 }, { value: 8 }, { value: 8 }, { value: 7 }, { value: 5 }, { value: 6 }, { value: 9 }],
  [{ value: "8024320012" }, { value: "Guppi" }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 6 }, { value: 8 }, { value: 9 }, { value: 6 }],
];


const COTable = () => {
  const [data, setData] = useState(initialData);

  // Add Row at the end
  const handleAddRow = () => {
    const numCols = data[0].length;
    const newRow = Array(numCols).fill().map(() => ({ value: "" }));
    setData([...data, newRow]);
  };

  // Remove last row (not the header)
  const handleRemoveRow = () => {
    if (data.length > 2) setData(data.slice(0, -1));
  };

  // Add Column at the end
  const handleAddColumn = () => {
    const colName = prompt("Enter column name:", "New Column") || "New Column";
    setData(prev =>
      prev.map((row, rowIdx) => [...row, { value: rowIdx === 0 ? colName : "" }])
    );
  };

  // Remove last column
  const handleRemoveColumn = () => {
    if (data[0].length > 1) {
      setData(prev => prev.map(row => row.slice(0, -1)));
    }
  };

  return (
    <div className="p-[3px] rounded-2xl bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 max-w-6xl mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-2xl py-6 px-4 min-h-[70vh] overflow-x-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            onClick={handleAddRow}
          >
            Add Row
          </button>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleRemoveRow}
            disabled={data.length <= 2}
            style={{ opacity: data.length <= 2 ? 0.5 : 1 }}
          >
            Remove Row
          </button>
          <button
            className="px-4 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            onClick={handleAddColumn}
          >
            Add Column
          </button>
          <button
            className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
            onClick={handleRemoveColumn}
            disabled={data[0].length <= 1}
            style={{ opacity: data[0].length <= 1 ? 0.5 : 1 }}
          >
            Remove Column
          </button>
        </div>
        <div className="w-full min-w-[700px]">
          <Spreadsheet data={data} onChange={setData} />
        </div>
      </div>
    </div>
  );
};

export default COTable;
