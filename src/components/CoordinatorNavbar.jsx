import { useState } from "react";

export default function CoordinatorNavbar({ onLogout }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 w-full py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        
        {/* Brand */}
        <a href="/" className="text-2xl font-bold">
          Greenbit <span className="text-green-600">Solutions</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-lg">
          <a
            href="#"
            className="hover:bg-green-100 px-3 py-2 rounded-md transition-colors duration-300"
          >
            
          </a>
          <a
            href="#"
            className="hover:bg-green-100 px-3 py-2 rounded-md transition-colors duration-300"
          >
            
          </a>
          <a
            href="#"
            className="hover:bg-green-100 px-3 py-2 rounded-md transition-colors duration-300"
          >
            
          </a>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
