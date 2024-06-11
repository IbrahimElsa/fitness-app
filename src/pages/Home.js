import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomBarChart from "../components/CustomBarChart";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { format } from 'date-fns';
import { getDoc, doc } from 'firebase/firestore';
import { db } from "../firebaseConfig";

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggleTheme, theme, themeCss } = useTheme();
  const [data, setData] = useState([]);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const calculatePastSundays = () => {
      const sundays = [];
      let today = new Date();
      today.setDate(today.getDate() - today.getDay() + 7); // Set to the upcoming Sunday
      for (let i = 0; i < 6; i++) {
        sundays.unshift({
          date: format(new Date(today), 'MM-dd'),
          days: Math.floor(Math.random() * 5) + 2 
        });
        today.setDate(today.getDate() - 7);
      }
      return sundays;
    };

    const updateData = () => {
      setData(calculatePastSundays());
    };

    updateData();

    const intervalId = setInterval(() => {
      updateData(); // Update every week
    }, 604800000); // 604800000 ms in a week

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setProfilePic(userDoc.data().profilePic);
        }
      }
    };
    fetchProfilePic();
  }, [currentUser]);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className={`${themeCss[theme]}`}>
      <Navbar />
      <div className="flex flex-col h-screen">
        <div className="px-4 py-2 flex justify-between items-center w-full">
          <h1 className="text-3xl pt-12 pl-6 font-bold">Home</h1>
          {currentUser ? (
            <div className="relative">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="rounded-full w-12 h-12 object-cover cursor-pointer"
                  onClick={handleToggleDropdown}
                />
              ) : (
                <FontAwesomeIcon 
                  icon={faUserCircle} 
                  size="2x" 
                  className="cursor-pointer" 
                  onClick={handleToggleDropdown} 
                />
              )}
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
