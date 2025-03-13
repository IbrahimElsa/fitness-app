// src/pages/Statistics.js - Optimized with local caching
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ExerciseProgressChart from "../components/ExerciseProgressChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2, Activity, Users, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";

function StatisticsPage() {
  const navigate = useNavigate();
  const { theme, themeCss } = useTheme();
  const { currentUser } = useAuth();
  
  const [workoutData, setWorkoutData] = useState([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [mostCommonExercise, setMostCommonExercise] = useState('');
  const [avgWorkoutDuration, setAvgWorkoutDuration] = useState(0);
  const [muscleGroupDistribution, setMuscleGroupDistribution] = useState([]);
  const [topExercises, setTopExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    progress: true,
    distribution: true
  });
  
  // Function to calculate stats from workout data - memoized to prevent recalculations
  const calculateWorkoutStats = useCallback((workouts) => {
    // Total workouts
    setTotalWorkouts(workouts.length);
    
    // Exercise frequency analysis
    const exerciseCount = {};
    const muscleCount = {};
    
    // Track duration
    let totalMinutes = 0;
    
    // Extract all unique exercises across all workouts
    const allExercises = new Set();
    
    workouts.forEach(workout => {
      // Count exercises
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.Name] = (exerciseCount[exercise.Name] || 0) + 1;
        muscleCount[exercise.Muscle] = (muscleCount[exercise.Muscle] || 0) + 1;
        
        // Add to exercise list if it has data
        if (exercise.sets && exercise.sets.length > 0) {
          allExercises.add(exercise.Name);
        }
      });
      
      // Calculate duration
      if (workout.duration) {
        const durationStr = workout.duration;
        const [hours, minutes, seconds] = durationStr.split(':').map(Number);
        totalMinutes += hours * 60 + minutes + seconds / 60;
      }
    });
    
    // Find most common exercise
    let maxCount = 0;
    let maxExercise = '';
    Object.entries(exerciseCount).forEach(([exercise, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxExercise = exercise;
      }
    });
    setMostCommonExercise(maxExercise);
    
    // Average workout duration
    const avgDuration = workouts.length > 0 ? totalMinutes / workouts.length : 0;
    setAvgWorkoutDuration(avgDuration);
    
    // Muscle group distribution
    const muscleDistribution = Object.entries(muscleCount)
      .filter(([muscle]) => muscle) // Filter out undefined/null
      .map(([muscle, count]) => ({
        name: muscle,
        value: count
      }))
      .sort((a, b) => b.value - a.value);
    setMuscleGroupDistribution(muscleDistribution);
    
    // Top exercises
    const topExercisesData = Object.entries(exerciseCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopExercises(topExercisesData);
    
    // Set exercise list
    const exerciseArray = [...allExercises].sort();
    setExerciseList(exerciseArray);
    
    // Set default selected exercise if available
    if (exerciseArray.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseArray[0]);
    }
  }, [selectedExercise]);

  // Fetch workout data only when user changes or component mounts
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // First try to get data from localStorage to avoid unnecessary fetches
        const cachedData = localStorage.getItem(`workoutData_${currentUser.uid}`);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          // Check if cache is less than 5 minutes old
          const cacheTime = localStorage.getItem(`workoutDataTimestamp_${currentUser.uid}`);
          const now = Date.now();
          if (cacheTime && now - parseInt(cacheTime) < 5 * 60 * 1000) {
            // Convert timestamp strings back to Date objects
            const processedData = parsedData.map(workout => ({
              ...workout,
              timestamp: new Date(workout.timestamp)
            }));
            setWorkoutData(processedData);
            calculateWorkoutStats(processedData);
            setIsLoading(false);
            return;
          }
        }

        // If no valid cache, fetch from Firestore
        setIsLoading(true);
        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"));
        const workoutsSnapshot = await getDocs(q);
        
        const workouts = workoutsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
          };
        });
        
        // Cache the data in localStorage
        const workoutsForCache = workouts.map(workout => ({
          ...workout,
          timestamp: workout.timestamp.toISOString() // Convert Date to string for JSON
        }));
        localStorage.setItem(`workoutData_${currentUser.uid}`, JSON.stringify(workoutsForCache));
        localStorage.setItem(`workoutDataTimestamp_${currentUser.uid}`, Date.now().toString());
        
        setWorkoutData(workouts);
        calculateWorkoutStats(workouts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching workout data:", error);
        setIsLoading(false);
      }
    };

    fetchWorkoutData();
  }, [currentUser, calculateWorkoutStats]);

  // Handle exercise selection without causing data refetch
  const handleExerciseChange = (e) => {
    setSelectedExercise(e.target.value);
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}h ${mins}m`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Colors for pie chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const renderSection = (title, id, icon, content) => (
    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl mb-6 overflow-hidden`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => toggleSection(id)}
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-bold ml-2">{title}</h2>
        </div>
        {expandedSections[id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {expandedSections[id] && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {content}
        </div>
      )}
    </div>
  );

  return (
    <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen pb-20`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-8">Workout Statistics</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : !currentUser ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Sign in to view your statistics</h2>
            <button
              onClick={() => navigate('/login')}
              className={`py-2 px-6 rounded-lg ${themeCss.primaryButton}`}
            >
              Log in
            </button>
          </div>
        ) : workoutData.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto mb-4 text-slate-400" />
            <h2 className="text-xl font-semibold mb-2">No workout data yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Complete workouts to see your statistics
            </p>
            <button
              onClick={() => navigate('/workout')}
              className={`py-2 px-6 rounded-lg ${themeCss.primaryButton}`}
            >
              Start a Workout
            </button>
          </div>
        ) : (
          <div>
            {/* Overview Section */}
            {renderSection(
              "Workout Overview", 
              "overview", 
              <BarChart2 size={20} className="text-indigo-500" />,
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Workouts</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalWorkouts}</p>
                </div>
                
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-green-50' : 'bg-green-900/20'}`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Duration</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatDuration(avgWorkoutDuration)}</p>
                </div>
                
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-amber-50' : 'bg-amber-900/20'} col-span-2`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Most Popular Exercise</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 truncate">{mostCommonExercise}</p>
                </div>
              </div>
            )}
            
            {/* Progress Chart Section */}
            {renderSection(
              "Exercise Progress", 
              "progress", 
              <Activity size={20} className="text-green-500" />,
              <div>
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <label className="block text-sm font-medium mb-2 md:mb-0">
                      Select Exercise to Track Progress
                    </label>
                    
                    <div className="relative w-full md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Dumbbell size={16} className="text-slate-400" />
                      </div>
                      <select
                        value={selectedExercise}
                        onChange={handleExerciseChange}
                        className={`pl-10 pr-4 py-2 rounded-lg border appearance-none cursor-pointer ${
                          theme === 'light' 
                          ? 'border-slate-300 bg-white' 
                          : 'border-slate-600 bg-slate-700'
                        } w-full`}
                      >
                        <option value="">Select an exercise</option>
                        {exerciseList.map(exercise => (
                          <option key={exercise} value={exercise}>
                            {exercise}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <ExerciseProgressChart 
                  selectedExercise={selectedExercise} 
                  workoutData={workoutData} 
                />
              </div>
            )}
            
            {/* Muscle Group Distribution */}
            {renderSection(
              "Muscle Group Distribution", 
              "distribution", 
              <Users size={20} className="text-amber-500" />,
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={muscleGroupDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {muscleGroupDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} exercises`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Exercises</h3>
                  <div className="space-y-3">
                    {topExercises.map((exercise, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium truncate mr-2">{exercise.name}</p>
                          <p className="text-indigo-600 dark:text-indigo-400 font-bold">{exercise.count}x</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <MobileNavbar />
    </div>
  );
}

export default StatisticsPage;