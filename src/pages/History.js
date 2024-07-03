import React, { useEffect, useState } from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { useTheme } from "../components/ThemeContext";
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";

function HistoryPage() {
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState([]);

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white';

    useEffect(() => {
        if (!currentUser) {
            console.log("No current user found.");
            return;
        }

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("timestamp", "desc"));

        console.log("Querying workouts collection:", workoutsRef.path);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Snapshot size:", snapshot.size);
            console.log("Snapshot empty:", snapshot.empty);

            if (snapshot.empty) {
                console.log("No workouts found in the database.");
                setWorkouts([]);
                return;
            }

            const workoutsData = snapshot.docs.map((doc) => {
                const data = doc.data();


                const formattedDuration = typeof data.duration === 'string'
                    ? data.duration
                    : `${data.duration.hours || 0}h ${data.duration.minutes || 0}m ${data.duration.seconds || 0}s`;

                const timestamp = data.timestamp;
                let date;
                if (timestamp instanceof Date) {
                    date = timestamp;
                } else if (timestamp && timestamp.toDate) {
                    date = timestamp.toDate();
                } else {
                    date = new Date(timestamp);
                }

                return {
                    id: doc.id,
                    duration: formattedDuration,
                    exercises: data.exercises,
                    date: date,
                };
            });

            console.log("Fetched workouts data:", workoutsData);
            setWorkouts(workoutsData);
        }, (error) => {
            console.error("Error fetching workouts:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className={`history-page ${containerClass}`}>
            <Navbar />
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="text-xl font-bold text-right">History</h1>
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen pt-10">
                {workouts.length > 0 ? (
                    workouts.map((workout) => (
                        <div key={workout.id} className={`workout-item ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-700 text-white'} shadow-md rounded-lg p-4 mb-4 w-11/12`}>
                            <p className="text-lg font-bold">Workout on {workout.date.toLocaleDateString()}</p>
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
                    ))
                ) : (
                    <p>No workouts found</p>
                )}
                <MobileNavbar />
            </div>
        </div>
    );
}

export default HistoryPage;
