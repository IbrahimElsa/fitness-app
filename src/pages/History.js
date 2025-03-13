// src/pages/History.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { useTheme } from "../components/ThemeContext";
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, startAfter, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Calendar, Clock, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function HistoryPage() {
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState(() => {
        // Load initial workouts from local storage if available
        const savedWorkouts = localStorage.getItem("recentWorkouts");
        return savedWorkouts ? JSON.parse(savedWorkouts) : [];
    });
    const [expandedWorkouts, setExpandedWorkouts] = useState({});
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const observer = useRef();

    const loadMoreWorkouts = useCallback(async () => {
        if (!currentUser || !lastVisible || loading || !hasMoreWorkouts) return;

        setLoading(true);

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(8));

        try {
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                setHasMoreWorkouts(false);
                setLoading(false);
                return;
            }

            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(lastVisibleDoc);

            const newWorkouts = snapshot.docs.map(docToWorkout);

            setWorkouts(prevWorkouts => [...prevWorkouts, ...newWorkouts]);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching more workouts:", error);
            setLoading(false);
        }
    }, [currentUser, lastVisible, loading, hasMoreWorkouts]);

    const lastWorkoutElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreWorkouts) {
                loadMoreWorkouts();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMoreWorkouts, loadMoreWorkouts]);

    useEffect(() => {
        if (!currentUser) {
            console.log("No current user found.");
            return;
        }

        setLoading(true);

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"), limit(8));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                console.log("No workouts found in the database.");
                setWorkouts([]);
                setHasMoreWorkouts(false);
                setLoading(false);
                return;
            }

            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(lastVisibleDoc);

            const workoutsData = snapshot.docs.map(docToWorkout);

            setWorkouts(workoutsData);
            // Save the most recent workouts to local storage
            localStorage.setItem("recentWorkouts", JSON.stringify(workoutsData));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching workouts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const docToWorkout = (doc) => {
        const data = doc.data();
        const formattedDuration = typeof data.duration === 'string'
            ? data.duration
            : `${data.duration.hours || 0}h ${data.duration.minutes || 0}m ${data.duration.seconds || 0}s`;

        const timestamp = data.timestamp;
        let date = timestamp instanceof Date ? timestamp : 
                   timestamp && timestamp.toDate ? timestamp.toDate() : 
                   new Date(timestamp);

        return {
            id: doc.id,
            duration: formattedDuration,
            exercises: data.exercises,
            date: date,
        };
    };

    const toggleWorkoutExpansion = (workoutId) => {
        setExpandedWorkouts(prev => ({
            ...prev,
            [workoutId]: !prev[workoutId]
        }));
    };

    // Group workouts by month
    const getMonthYear = (date) => {
        const d = new Date(date);
        return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    };

    const workoutsByMonth = workouts.reduce((acc, workout) => {
        const monthYear = getMonthYear(workout.date);
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(workout);
        return acc;
    }, {});

    // Get available months for filter
    const availableMonths = Object.keys(workoutsByMonth);

    // Filter workouts by selected month
    const filteredWorkouts = selectedMonth 
        ? workoutsByMonth[selectedMonth] || [] 
        : workouts;

    // Format date for display
    const formatDate = (date) => {
        const d = new Date(date);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`min-h-screen ${theme === 'light' ? themeCss.light : themeCss.dark}`}>
            <Navbar />
            <div className="container mx-auto px-4 py-6 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Workout History</h1>
                    
                    {/* Month filter */}
                    {availableMonths.length > 0 && (
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className={`pl-8 pr-4 py-2 border rounded-lg appearance-none w-full ${
                                    theme === 'light' 
                                    ? themeCss.inputLight
                                    : themeCss.inputDark
                                }`}
                            >
                                <option value="">All Months</option>
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {filteredWorkouts.length === 0 && !loading && (
                    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-8 text-center`}>
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                        <h3 className="text-xl font-semibold mb-2">No Workouts Found</h3>
                        <p className={`${themeCss.secondaryText} mb-4`}>
                            {selectedMonth 
                                ? `You don't have any workouts logged for ${selectedMonth}.` 
                                : "You haven't logged any workouts yet."}
                        </p>
                        {selectedMonth && (
                            <button 
                                onClick={() => setSelectedMonth('')}
                                className={`px-4 py-2 rounded-lg ${themeCss.secondaryButton}`}
                            >
                                View All Months
                            </button>
                        )}
                    </div>
                )}

                {/* Workout list */}
                <div className="space-y-4">
                    {filteredWorkouts.map((workout, index) => (
                        <motion.div
                            key={workout.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            ref={index === filteredWorkouts.length - 1 ? lastWorkoutElementRef : null}
                            className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl overflow-hidden`}
                        >
                            {/* Workout header */}
                            <div 
                                className="p-4 border-b cursor-pointer flex items-center justify-between"
                                onClick={() => toggleWorkoutExpansion(workout.id)}
                            >
                                <div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                                        <h3 className="font-semibold">{formatDate(workout.date)}</h3>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                                        <p className={`text-sm ${themeCss.secondaryText}`}>
                                            {formatTime(workout.date)} • {workout.duration}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-sm ${themeCss.secondaryText}`}>
                                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                                    </span>
                                    {expandedWorkouts[workout.id] 
                                        ? <ChevronUp className="h-5 w-5 text-slate-400" />
                                        : <ChevronDown className="h-5 w-5 text-slate-400" />
                                    }
                                </div>
                            </div>
                            
                            {/* Workout details */}
                            <AnimatePresence>
                                {expandedWorkouts[workout.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 divide-y divide-slate-200 dark:divide-slate-700">
                                            {workout.exercises.map((exercise, idx) => (
                                                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-base">{exercise.Name}</h4>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${theme === 'light' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-900/30 text-indigo-300'}`}>
                                                            {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="mt-2 overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                                            <thead>
                                                                <tr>
                                                                    <th className={`px-3 py-2 text-left text-xs font-medium ${themeCss.secondaryText} uppercase tracking-wider`}>Set</th>
                                                                    <th className={`px-3 py-2 text-left text-xs font-medium ${themeCss.secondaryText} uppercase tracking-wider`}>Weight</th>
                                                                    <th className={`px-3 py-2 text-left text-xs font-medium ${themeCss.secondaryText} uppercase tracking-wider`}>Reps</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {exercise.sets.map((set, setIdx) => (
                                                                    <tr key={setIdx} className={`${
                                                                        setIdx % 2 === 0
                                                                            ? theme === 'light' ? 'bg-white' : 'bg-slate-800'
                                                                            : theme === 'light' ? 'bg-slate-50' : 'bg-slate-750'
                                                                    }`}>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">{setIdx + 1}</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">{set.weight} lb</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">{set.reps}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
                
                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                )}
                
                {/* End of workouts message */}
                {!loading && !hasMoreWorkouts && filteredWorkouts.length > 0 && (
                    <div className="text-center py-6">
                        <p className={`${themeCss.secondaryText}`}>
                            You've reached the end of your workout history
                        </p>
                    </div>
                )}
            </div>
            <MobileNavbar />
        </div>
    );
}

export default HistoryPage;