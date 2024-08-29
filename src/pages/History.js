import React, { useEffect, useState, useRef } from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { useTheme } from "../components/ThemeContext";
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, startAfter, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

function HistoryPage() {
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState(() => {
        // Load workouts from local storage if available
        const savedWorkouts = localStorage.getItem("workouts");
        return savedWorkouts ? JSON.parse(savedWorkouts) : [];
    });
    const [expandedWorkouts, setExpandedWorkouts] = useState({});
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true); // State to track if more workouts are available

    useEffect(() => {
        if (!currentUser) {
            console.log("No current user found.");
            return;
        }

        setLoading(true);

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"), limit(10));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                console.log("No workouts found in the database.");
                setWorkouts([]);
                setLoading(false);
                return;
            }

            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(lastVisibleDoc);

            const workoutsData = snapshot.docs.map((doc) => {
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
            });

            setWorkouts(workoutsData);
            // Save workouts to local storage
            localStorage.setItem("workouts", JSON.stringify(workoutsData));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching workouts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const loadMoreWorkouts = () => {
        if (!currentUser || !lastVisible) return;

        setLoading(true);

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(10));

        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                console.log("No more workouts found in the database.");
                setHasMoreWorkouts(false); // Set this to false when no more workouts are available
                setLoading(false);
                return;
            }

            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(lastVisibleDoc);

            const newWorkouts = snapshot.docs.map((doc) => {
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
            });

            setWorkouts(prevWorkouts => {
                const updatedWorkouts = [...prevWorkouts, ...newWorkouts];
                // Save updated workouts to local storage
                localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
                return updatedWorkouts;
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching more workouts:", error);
            setLoading(false);
        });
    };

    const toggleWorkoutExpansion = (workoutId) => {
        setExpandedWorkouts(prev => ({
            ...prev,
            [workoutId]: !prev[workoutId]
        }));
    };

    const WorkoutItem = ({ workout }) => {
        const [isOverflowing, setIsOverflowing] = useState(false);
        const contentRef = useRef(null);
    
        useEffect(() => {
            const checkOverflow = () => {
                if (contentRef.current) {
                    const isOverflowing = contentRef.current.scrollHeight > contentRef.current.clientHeight;
                    setIsOverflowing(isOverflowing);
                }
            };
    
            checkOverflow();
            window.addEventListener('resize', checkOverflow);
            return () => window.removeEventListener('resize', checkOverflow);
        }, [workout]);
    
        // Ensure workout.date is a Date object
        const workoutDate = workout.date instanceof Date ? workout.date : new Date(workout.date);
    
        const isExpanded = expandedWorkouts[workout.id];
    
        const fadeClass = theme === 'light' 
            ? 'from-gray-300 to-transparent'
            : 'from-gray-900 to-transparent';
    
        return (
            <div className={`workout-item ${themeCss[theme]} shadow-md rounded-lg p-4 mb-4 w-11/12 relative ${theme === 'dark' ? themeCss.outlineDark : themeCss.outlineLight}`}>
                <div 
                    ref={contentRef} 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-full' : 'max-h-[33vh]'}`}
                >
                    <p className="text-lg font-bold">Workout on {workoutDate.toLocaleDateString()}</p>
                    <p className="text-sm">Duration: {workout.duration}</p>
                    {workout.exercises.map((exercise, index) => (
                        <div key={index} className="exercise-item mt-4">
                            <h3 className="text-md font-semibold">{exercise.Name}</h3>
                            <div className="flex items-center mb-2">
                                <h4 className="w-1/4">Set</h4>
                                <h4 className="w-1/4">Weight</h4>
                                <h4 className="w-1/4">Reps</h4>
                            </div>
                            {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className="flex items-center mb-2">
                                    <span className="w-1/4">{setIndex + 1}</span>
                                    <span className="w-1/4">{set.weight}</span>
                                    <span className="w-1/4">{set.reps}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {isOverflowing && (
                    <div 
                        className={`absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center 
                                    ${!isExpanded ? `bg-gradient-to-t ${fadeClass}` : ''}`}
                    >
                        <button
                            onClick={() => toggleWorkoutExpansion(workout.id)}
                            className={`${themeCss[`navbar${theme === 'light' ? 'Light' : 'Dark'}`]} rounded-full p-2 mb-2`}
                        >
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`history-page ${themeCss[theme]} flex flex-col min-h-screen relative`}>
            <Navbar />
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="text-xl font-bold text-right">History</h1>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow pt-10 pb-20"> {/* Adjust bottom padding */}
                {workouts.length > 0 ? (
                    workouts.map((workout) => (
                        <WorkoutItem key={workout.id} workout={workout} />
                    ))
                ) : (
                    <p>No workouts found</p>
                )}
                {loading && <p>Loading...</p>}
                {!loading && hasMoreWorkouts ? (
                    <button 
                        onClick={loadMoreWorkouts} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        Load More
                    </button>
                ) : (
                    !loading && <p>All Workouts Displayed</p>
                )}
            </div>
            <MobileNavbar className="absolute bottom-0 left-0 right-0" /> {/* Ensure MobileNavbar is absolute */}
        </div>
    );
}

export default HistoryPage;
