import React from 'react';
import COTable from './components/COtable';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-black py-8 px-2">
  <h1
  className="text-3xl sm:text-4xl font-bold text-center mb-8 underline"
  style={{ color: "#fff", textDecorationColor: "#fff" }}
>
  🎓 Student CO Matrix
</h1>


      <div className="w-full flex justify-center">
        <COTable />
      </div>
    </div>
  );
};

export default App;


