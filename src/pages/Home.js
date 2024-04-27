import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomBarChart from "../components/CustomBarChart";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggleTheme, theme, themeCss } = useTheme();

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const data = [
    { date: '03-05', days: 4 },
    { date: '03-12', days: 5 },
    { date: '03-19', days: 3 },
    { date: '03-26', days: 4 },
    { date: '04-02', days: 2 },
    { date: '04-09', days: 6 },
  ];

  return (
    <div className={`${themeCss[theme]}`}>
      <Navbar />
      <div className="flex flex-col h-screen">
        <div className="px-4 py-2 flex justify-between items-center w-full">
          <h1 className="text-3xl pt-12 pl-6 font-bold">Home</h1>
          {currentUser ? (
            <div className="relative">
              <FontAwesomeIcon icon={faUserCircle} size="2x" className="cursor-pointer" onClick={handleToggleDropdown} />
              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 py-2 w-48 rounded-md shadow-xl z-20 ${themeCss[theme]}`}>
                  <Link to="/profile" className="block px-4 py-2 text-sm capitalize hover:bg-blue-500 hover:text-white">
                    Profile
                  </Link>
                  <div className="flex items-center px-4 py-2">
                    <span className="text-sm capitalize">Theme: {theme}</span>
                    <button
                      onClick={toggleTheme}
                      className="ml-2 px-2 py-1 rounded-md hover:bg-gray-300"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          )}
        </div>
        <div className="flex flex-col items-center flex-1 p-4 mt-10">
          <CustomBarChart data={data} />
        </div>
      </div>
      <MobileNavbar />
    </div>
  );
}

export default Home;