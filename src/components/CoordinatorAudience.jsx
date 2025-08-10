// export default function CoordinatorAudience() {
//   return (
//     <section className="bg-white">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
//         {/* Title */}
//         <div className="text-center mb-12">
//           <h2 className="text-3xl sm:text-[34px] font-extrabold text-[#3a2ea1]">
//             Accreditation Management System that is catered to everyone&apos;s needs
//           </h2>
//           <div className="mt-4 flex items-center justify-center gap-2">
//             <span className="h-1 w-16 rounded-full bg-[#3a2ea1]/80"></span>
//             <span className="h-1 w-6 rounded-full bg-[#3a2ea1]/60"></span>
//           </div>
//         </div>

//         {/* Cards */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <HoverCard
//             title="Institutions"
//             body={`Organize all the data required for successful submissions such as SAR, SSR, CIR, etc.
// Indulge in outcomes mapping, performance frameworks, and attainment calculations, in just a few clicks.`}
//           />

//           <HoverCard
//             title="IQAC Coordinators"
//             body={`Comply with multiple regulations, perfectly plan accreditation/re-accreditation processes,
// upload documents, self-assess, receive updates and send status to Accreditation bodies on a timely basis.`}
//           />

//           <HoverCard
//             title="Accreditation Agencies"
//             body={`Gain complete control to assign project managers, reviewers, and expert committees,
// schedule on-site team visits, make payments and prepare reports to evaluate and track down to completion.`}
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

// /* ----------------- Reusable card with hover gradient ----------------- */

// function HoverCard({ title, body }) {
//   return (
//     <div
//       className="
//         group relative rounded-[28px] overflow-hidden
//         border border-gray-100 bg-white shadow-md
//         transform transition-all duration-300
//         hover:-translate-y-3 hover:shadow-2xl hover:border-transparent
//       "
//     >
//       {/* Gradient overlay (hidden -> visible on hover) */}
//       <div
//         className="
//           absolute inset-0
//           bg-gradient-to-br from-[#4a90e2] to-[#3b4dff]
//           opacity-0 transition-opacity duration-300
//           group-hover:opacity-100
//         "
//       />

//       {/* Content */}
//       <div
//         className="
//           relative z-10 p-8
//           transition-colors duration-300
//           bg-white group-hover:bg-transparent
//         "
//       >
//         <h3
//           className="
//             text-xl sm:text-2xl font-semibold
//             text-gray-900 group-hover:text-white
//             transition-colors duration-300
//           "
//         >
//           {title}
//         </h3>

//         <p
//           className="
//             mt-4 leading-7
//             text-gray-600 group-hover:text-white/90
//             transition-colors duration-300
//           "
//         >
//           {body}
//         </p>
//       </div>
//     </div>
//   );
// }


// src/components/CoordinatorAudience.jsx
export default function CoordinatorAudience() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-[34px] font-extrabold text-[#3a2ea1]">
            Accreditation Management System that is catered to everyone&apos;s needs
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-1 w-16 rounded-full bg-[#3a2ea1]/80" />
            <span className="h-1 w-6 rounded-full bg-[#3a2ea1]/60" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <HoverCard
            title="Institutions"
            body={`Organize all the data required for successful submissions such as SAR, SSR, CIR, etc. Indulge in outcomes mapping, performance frameworks, and attainment calculations, in just a few clicks.`}
          />
          <HoverCard
            title="IQAC Coordinators"
            body={`Comply with multiple regulations, perfectly plan accreditation/re-accreditation processes, upload documents, self-assess, receive updates and send status to Accreditation bodies on a timely basis.`}
          />
          <HoverCard
            title="Accreditation Agencies"
            body={`Gain complete control to assign project managers, reviewers, and expert committees, schedule on-site team visits, make payments and prepare reports to evaluate and track down to completion.`}
          />
        </div>
      </div>
    </section>
  );
}

function HoverCard({ title, body }) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-[28px]
        border border-gray-100 bg-white shadow-md
        transition-all duration-300
        hover:-translate-y-3 hover:shadow-2xl hover:border-transparent

        /* Gradient (blue-ish) on hover */
        hover:bg-gradient-to-br hover:from-[#4a90e2] hover:to-[#3b4dff]
        /* If you prefer a solid bluish color instead, comment the two lines above
           and uncomment the next line: */
        /* hover:bg-[#5d5d72] */
      "
    >
      {/* No inner white background now—let gradient show through */}
      <div className="relative z-10 p-8 transition-colors duration-300 group-hover:text-white">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">{title}</h3>
        <p className="leading-7">{body}</p>
      </div>
    </div>
  );
}
