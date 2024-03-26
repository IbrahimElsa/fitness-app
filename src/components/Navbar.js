import React from "react";

const Navbar = () => {
return (
    <nav className="hidden md:block bg-blue-500 text-white py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            {/* Logo or Brand name */}
            <div>
              {/* <a href="#" className="flex items-center text-white py-2 px-3">
                <span className="font-bold">My Fitness Tracker</span>
              </a> */}
            </div>
            {/* Primary Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {/* <a href="#" className="py-2 px-3 text-white rounded hover:bg-blue-700 transition duration-300">Home</a>
              <a href="#" className="py-2 px-3 text-white rounded hover:bg-blue-700 transition duration-300">About</a>
              <a href="#" className="py-2 px-3 text-white rounded hover:bg-blue-700 transition duration-300">Services</a>
              <a href="#" className="py-2 px-3 text-white rounded hover:bg-blue-700 transition duration-300">Contact</a> */}
            </div>
          </div>
          {/* Secondary Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {/* <a href="#" className="py-2 px-3 text-white rounded hover:bg-blue-700 transition duration-300">Login</a>
            <a href="#" className="py-2 px-3 text-white bg-blue-700 hover:bg-blue-800 rounded transition duration-300">Sign Up</a> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
