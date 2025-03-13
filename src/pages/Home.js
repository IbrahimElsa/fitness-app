// Home page stats calculation and display
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomCalendar from "../components/CustomCalendar";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { getDocs, collection, query, getDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from "../firebaseConfig";
import { Calendar, User, Sun, Moon, ChevronRight, Award, Clock, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggleTheme, theme, themeCss } = useTheme();
  const [gymVisits, setGymVisits] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    streakDays: 0,
    lastWorkout: null
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!currentUser) return;

      try {
        // Fetch all workouts
        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setGymVisits([]);
          setWorkoutStats({
            totalWorkouts: 0,
            thisWeekWorkouts: 0,
            streakDays: 0,
            lastWorkout: null
          });
          localStorage.setItem("gymVisits", JSON.stringify([]));
          return;
        }

        // Process workout dates
        const workoutDates = snapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp;
          // Handle different timestamp formats
          if (timestamp instanceof Date) return timestamp;
          if (timestamp && timestamp.toDate) return timestamp.toDate();
          return new Date(timestamp);
        });
        
        // Sort dates in descending order (newest first)
        workoutDates.sort((a, b) => b - a);
        
        setGymVisits(workoutDates);
        localStorage.setItem("gymVisits", JSON.stringify(workoutDates.map(date => date.toISOString())));

        // Calculate stats
        calculateWorkoutStats(workoutDates);
      } catch (error) {
        console.error("Error fetching workout data:", error);
      }
    };

    fetchWorkoutData();
  }, [currentUser]);

  // Calculate all workout statistics
  const calculateWorkoutStats = (workoutDates) => {
    if (!workoutDates.length) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Last 7 days including today
    
    // Format dates to compare by day only
    const formattedWorkoutDates = workoutDates.map(date => {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });
    
    // Remove duplicate days
    const uniqueDates = [...new Set(formattedWorkoutDates)].sort((a, b) => b - a);
    
    // Calculate this week's workouts
    const weekStart = oneWeekAgo.getTime();
    const thisWeekWorkouts = uniqueDates.filter(date => date >= weekStart).length;
    
    // Calculate streak
    let streak = 0;
    const todayTime = today.getTime();
    
    // Check if workout today
    if (uniqueDates[0] === todayTime) {
      streak = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        prevDate.setDate(prevDate.getDate() - 1);
        
        if (uniqueDates[i] === prevDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    } 
    // Check if workout yesterday (streak continues)
    else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTime = yesterday.getTime();
      
      if (uniqueDates[0] === yesterdayTime) {
        streak = 1;
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1]);
          prevDate.setDate(prevDate.getDate() - 1);
          
          if (uniqueDates[i] === prevDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    
    setWorkoutStats({
      totalWorkouts: workoutDates.length,
      thisWeekWorkouts,
      streakDays: streak,
      lastWorkout: workoutDates[0]
    });
  };

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
  
  const getTimeSinceLastWorkout = () => {
    if (!workoutStats.lastWorkout) return 'No workouts yet';
    
    const now = new Date();
    const lastWorkout = new Date(workoutStats.lastWorkout);
    const diffTime = Math.abs(now - lastWorkout);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      if (diffHours === 0) {
        return 'Just now';
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen flex flex-col`}>
      <Navbar />
      <div className="flex flex-col flex-grow overflow-y-auto pb-20">
        <div className="container mx-auto px-4 pt-4">
          {/* Header with Profile */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className={`${themeCss.secondaryText}`}>
                {currentUser ? 'Welcome back' : 'Track your fitness progress'}
              </p>
            </div>
            
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="rounded-full w-12 h-12 object-cover cursor-pointer border-2 border-indigo-500"
                    onClick={handleToggleDropdown}
                  />
                ) : (
                  <div
                    className="rounded-full w-12 h-12 bg-slate-200 dark:bg-slate-700 flex items-center justify-center cursor-pointer"
                    onClick={handleToggleDropdown}
                  >
                    <User size={24} className="text-slate-500 dark:text-slate-400" />
                  </div>
                )}
                
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 py-2 w-56 rounded-xl shadow-xl z-20 ${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} border border-slate-200 dark:border-slate-700`}
                  >
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-lg mx-1">
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    
                    <button
                      onClick={toggleTheme}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-lg mx-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {theme === 'light' ? <Moon size={16} className="mr-2" /> : <Sun size={16} className="mr-2" />}
                          <span>Toggle Theme</span>
                        </div>
                        <div className={`w-8 h-4 ${theme === 'light' ? 'bg-slate-300' : 'bg-indigo-600'} rounded-full relative`}>
                          <div className={`absolute w-3 h-3 bg-white rounded-full top-0.5 transition-all duration-200 ${theme === 'light' ? 'left-0.5' : 'left-4.5'}`}></div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                className={`py-2 px-4 rounded-lg ${themeCss.primaryButton}`}
                onClick={() => navigate('/login')}
              >
                Log in
              </button>
            )}
          </div>
          
          {/* Stats Cards for logged-in users */}
          {currentUser && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} p-4 rounded-xl`}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${theme === 'light' ? 'bg-indigo-100' : 'bg-indigo-900/30'} mr-3`}>
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${themeCss.secondaryText}`}>Total Workouts</p>
                    <p className="text-xl font-bold">{workoutStats.totalWorkouts}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} p-4 rounded-xl`}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${theme === 'light' ? 'bg-emerald-100' : 'bg-emerald-900/30'} mr-3`}>
                    <BarChart size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${themeCss.secondaryText}`}>This Week</p>
                    <p className="text-xl font-bold">{workoutStats.thisWeekWorkouts}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} p-4 rounded-xl`}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${theme === 'light' ? 'bg-amber-100' : 'bg-amber-900/30'} mr-3`}>
                    <Award size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${themeCss.secondaryText}`}>Streak</p>
                    <p className="text-xl font-bold">{workoutStats.streakDays} days</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} p-4 rounded-xl`}
              >
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'} mr-3`}>
                    <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${themeCss.secondaryText}`}>Last Workout</p>
                    <p className="text-sm font-medium">{getTimeSinceLastWorkout()}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Calendar Section */}
          <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Activity Calendar</h2>
              
              {currentUser && (
                <Link 
                  to="/workout" 
                  className={`flex items-center text-sm font-medium ${themeCss.accentPrimary}`}
                >
                  Start Workout
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>
            
            <div className="w-full">
              <CustomCalendar gymVisits={gymVisits} />
            </div>
            
            {!currentUser && (
              <div className="text-center mt-4 py-4 px-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className={`${themeCss.secondaryText} mb-3`}>
                  Sign in to track your workouts and see your progress
                </p>
                <button
                  className={`py-2 px-6 rounded-lg ${themeCss.primaryButton}`}
                  onClick={() => navigate('/login')}
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNavbar />
    </div>
  );
}

export default Home;