import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomCalendar from "../components/CustomCalendar";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { getDocs, collection, query, getDoc, doc } from 'firebase/firestore';
import { db } from "../firebaseConfig";

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggleTheme, theme, themeCss } = useTheme();
  const [gymVisits, setGymVisits] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!currentUser) return;

      const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
      const q = query(workoutsRef);

      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map(doc => {
        const workoutData = doc.data();
        return new Date(workoutData.timestamp);
      });

      setGymVisits(workouts);
    };

    fetchWorkouts();
  }, [currentUser]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className={`${themeCss[theme]} min-h-screen flex flex-col`}>
      <Navbar />
      <div className="flex flex-col h-full items-center"> {/* Center content horizontally */}
        <div className="px-4 py-2 flex justify-between items-center w-full max-w-3xl"> {/* Add max width */}
          <h1 className="text-3xl pt-12 pl-6 font-bold">Home</h1>
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
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
                <div className={`absolute right-0 mt-2 py-2 w-48 rounded-md shadow-xl z-20 ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}>
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
        <div className="flex flex-col items-center flex-1 w-full max-w-3xl p-4 mt-10"> {/* Center content and add max width */}
          <CustomCalendar gymVisits={gymVisits} />
        </div>
      </div>
      <MobileNavbar />
    </div>
  );
}

export default Home;
