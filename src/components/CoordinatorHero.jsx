// src/components/CoordinatorHero.jsx
import heroRight from "../assets/hero-right.webp"; // or .png if that's what you saved

const CoordinatorHero = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT: Headline + copy */}
          <div>
            <h1 className="space-y-3">
              <span className="inline-block rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3 text-white text-3xl sm:text-4xl font-extrabold shadow-md">
                Accreditation
              </span>
              <br />
              <span className="inline-block rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3 text-white text-3xl sm:text-4xl font-extrabold shadow-md">
                Management Software
              </span>
            </h1>

            <p className="mt-6 text-gray-600 leading-7 max-w-xl">
              One centralized Accreditation Management Software to plan any
              accreditation requirements, assign the conditions to corresponding
              faculties for effective data computation, and track the KPIs for
              continuous improvement.
            </p>
          </div>

          {/* RIGHT: Image */}
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
              <img
                src={heroRight}
                alt="Analyzer and Planner preview"
                className="w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoordinatorHero;
